/**
 * Health endpoint (/health).
 *
 * Reports whether the backend env is configured and whether the database
 * answers a cheap `SELECT 1`. Lazy by design: no env read or DB connection at
 * import time, so `next build` succeeds with zero env vars and the route
 * never crashes when unconfigured. No secrets are ever included in the
 * response.
 */
import { NextResponse } from "next/server";
import { getDb, pingDb } from "@vytal-fit/db";
import packageJson from "../../../package.json";

export const dynamic = "force-dynamic";

type DbState = "ok" | "error" | "skipped";

export async function GET(): Promise<NextResponse> {
  const configured = Boolean(
    process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET,
  );

  let db: DbState = "skipped";
  if (configured) {
    try {
      await pingDb(getDb());
      db = "ok";
    } catch (error) {
      // Server-side only — the response never carries error details.
      console.error("[api/health] database ping failed:", error);
      db = "error";
    }
  }

  const status = db === "error" ? "degraded" : "ok";

  return NextResponse.json(
    {
      status,
      backend: configured ? "configured" : "unconfigured",
      db,
      version: packageJson.version,
    },
    { status: db === "error" ? 503 : 200 },
  );
}
