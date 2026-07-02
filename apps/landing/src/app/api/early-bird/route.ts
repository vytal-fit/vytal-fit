import { NextResponse } from "next/server";
import { getDb, waitlist } from "@vytal-fit/db";

// Node runtime: the Postgres driver is not edge-compatible.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[early-bird] insert failed", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
