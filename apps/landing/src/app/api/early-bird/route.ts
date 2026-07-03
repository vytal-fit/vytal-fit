import { NextResponse } from "next/server";
import { getDb, waitlist } from "@vytal-fit/db";
import { sendEmail } from "@vytal-fit/email";

// Node runtime: the Postgres driver is not edge-compatible.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fire-and-forget team notification. Never blocks or fails the signup: the
// lead is already safe in the DB, so email problems must not surface to the
// visitor. Skipped automatically when no provider is configured (logs instead).
async function notifyTeam(lead: {
  name: string;
  email: string;
  gymName: string | null;
  vertical: string | null;
  message: string | null;
  locale: string;
}): Promise<void> {
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
    console.error("[early-bird] notification email failed", err);
  }
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
  const name = clean(b.name, 120);
  const email = clean(b.email, 200)?.toLowerCase() ?? null;
  const gymName = clean(b.gymName, 160);
  const vertical = clean(b.vertical, 60);
  const message = clean(b.message, 2000);
  const locale = clean(b.locale, 5) ?? "pt";

  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  try {
    const db = getDb();
    await db
      .insert(waitlist)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        gymName,
        vertical,
        message,
        locale,
        source: "landing",
      })
      // A repeat sign-up with the same email is a success, not an error.
      .onConflictDoNothing({ target: waitlist.email });

    await notifyTeam({ name, email, gymName, vertical, message, locale });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[early-bird] insert failed", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
