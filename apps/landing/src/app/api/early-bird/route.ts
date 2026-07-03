import { NextResponse } from "next/server";
import { getDb, waitlist } from "@vytal-fit/db";
import { sendEmail } from "@vytal-fit/email";

// Node runtime: the Postgres driver is not edge-compatible.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Lead = {
  name: string;
  email: string;
  gymName: string | null;
  vertical: string | null;
  message: string | null;
  locale: string;
};

// ── Team notification (non-blocking) ─────────────────────────────────────────
async function notifyTeam(lead: Lead): Promise<void> {
  const to = process.env.WAITLIST_NOTIFY_TO || process.env.EMAIL_FROM;
  if (!to) return;
  const rows: [string, string][] = [
    ["Nome", lead.name],
    ["Email", lead.email],
    ["Espaço", lead.gymName ?? "-"],
    ["Tipo", lead.vertical ?? "-"],
    ["Idioma", lead.locale],
  ];
  if (lead.message) rows.push(["Mensagem", lead.message]);

  const text = `Nova pré-reserva / early-bird do site.\n\n${rows
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}`;
  const html = `<h2>Nova pré-reserva · early-bird</h2><table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#6b8c72">${k}</td><td><strong>${v}</strong></td></tr>`)
    .join("")}</table>`;

  try {
    await sendEmail({
      to,
      replyTo: lead.email,
      subject: `Nova pré-reserva · ${lead.name}`,
      text,
      html,
      tags: ["waitlist", "early-bird"],
    });
  } catch (err) {
    console.error("[early-bird] team email failed", err);
  }
}

// ── Confirmation to the lead (non-blocking, localized) ───────────────────────
const CONFIRM: Record<string, { subject: string; greeting: (n: string) => string; body: string; sign: string }> = {
  pt: {
    subject: "Recebemos a sua pré-reserva · Vytal",
    greeting: (n) => `Olá ${n},`,
    body: "Obrigado pelo seu interesse no Vytal. Recebemos a sua pré-reserva e vamos entrar em contacto em breve com as condições exclusivas de espaço fundador. Se tiver qualquer questão, basta responder a este email.",
    sign: "Equipa Vytal",
  },
  en: {
    subject: "We got your early-bird request · Vytal",
    greeting: (n) => `Hi ${n},`,
    body: "Thanks for your interest in Vytal. We've received your early-bird request and we'll be in touch soon with exclusive founding-member terms. If you have any questions, just reply to this email.",
    sign: "The Vytal team",
  },
  es: {
    subject: "Hemos recibido tu prerreserva · Vytal",
    greeting: (n) => `Hola ${n},`,
    body: "Gracias por tu interés en Vytal. Hemos recibido tu prerreserva y te contactaremos pronto con las condiciones exclusivas de miembro fundador. Si tienes cualquier duda, responde a este email.",
    sign: "El equipo de Vytal",
  },
};

async function confirmLead(lead: Lead): Promise<void> {
  const c = CONFIRM[lead.locale] ?? CONFIRM.pt;
  const text = `${c.greeting(lead.name)}\n\n${c.body}\n\n${c.sign}`;
  const html = `<p style="font-family:system-ui,sans-serif;font-size:15px">${c.greeting(
    lead.name,
  )}</p><p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#334">${c.body}</p><p style="font-family:system-ui,sans-serif;font-size:15px;color:#22c55e"><strong>${c.sign}</strong></p>`;
  try {
    await sendEmail({ to: lead.email, subject: c.subject, text, html, tags: ["waitlist", "confirmation"] });
  } catch (err) {
    console.error("[early-bird] confirmation email failed", err);
  }
}

// ── Best-effort in-memory rate limit (per warm instance) ─────────────────────
// Serverless memory is not shared across instances, so this is a cheap first
// line against bursts, not a hard guarantee. The honeypot + timing checks are
// the primary bot defenses; dedupe-on-email caps DB growth.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Bot trap: real users never fill the hidden "company" field. Return a fake
  // success so bots don't learn they were caught.
  if (clean(b.company, 200)) {
    return NextResponse.json({ ok: true });
  }
  // Too fast to be human (form submitted < 1.5s after render) → drop silently.
  const elapsedMs = typeof b.elapsedMs === "number" ? b.elapsedMs : 0;
  if (elapsedMs > 0 && elapsedMs < 1500) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const name = clean(b.name, 120);
  const email = clean(b.email, 200)?.toLowerCase() ?? null;
  const gymName = clean(b.gymName, 160);
  const vertical = clean(b.vertical, 60);
  const message = clean(b.message, 2000);
  const locale = clean(b.locale, 5) ?? "pt";
  const consent = b.consent === true;

  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }
  // RGPD: explicit consent is required to store and contact the lead.
  if (!consent) {
    return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
  }

  const lead: Lead = { name, email, gymName, vertical, message, locale };

  try {
    const db = getDb();
    await db
      .insert(waitlist)
      .values({ id: crypto.randomUUID(), ...lead, source: "landing" })
      // A repeat sign-up with the same email is a success, not an error.
      .onConflictDoNothing({ target: waitlist.email });

    await Promise.allSettled([notifyTeam(lead), confirmLead(lead)]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[early-bird] insert failed", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
