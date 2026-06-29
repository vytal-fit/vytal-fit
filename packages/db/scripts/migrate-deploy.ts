/**
 * Deploy-time migration runner.
 *
 * Wired into the Vercel `buildCommand` so the production database is brought
 * in sync with the migrations committed to the branch Vercel deploys (main).
 * Runs AFTER a successful build — if it fails, the deployment is not promoted
 * and the previous version keeps serving.
 *
 * Guard rails:
 *   - Only runs on Vercel PRODUCTION deployments (`VERCEL_ENV=production`).
 *     Preview/development builds skip it so they never mutate the prod DB.
 *   - `FORCE_MIGRATE=1` overrides the guard (manual/CI runs outside Vercel).
 *   - Requires DATABASE_URL; loads .env files locally (shell env always wins).
 *
 * Idempotent: drizzle records applied migrations in `drizzle.__drizzle_migrations`
 * and only applies the pending ones, so re-running on every deploy is safe.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { loadEnvFiles } from "./load-env";

const MIGRATIONS_FOLDER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

async function main() {
  const vercelEnv = process.env.VERCEL_ENV;
  const forced = process.env.FORCE_MIGRATE === "1";

  // Skip on anything that isn't a production deploy, unless explicitly forced.
  if (!forced && vercelEnv !== "production") {
    console.log(
      `[migrate-deploy] Skipping — VERCEL_ENV=${vercelEnv ?? "(unset)"} ` +
        `(only runs on production; set FORCE_MIGRATE=1 to override).`,
    );
    return;
  }

  loadEnvFiles();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("[migrate-deploy] DATABASE_URL is not set.");
  }

  const reason = forced ? "FORCE_MIGRATE=1" : `VERCEL_ENV=${vercelEnv}`;
  console.log(`[migrate-deploy] Applying pending migrations (${reason})…`);

  // Single, dedicated connection — avoids pooled-session quirks during DDL.
  const sql = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(sql), { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("[migrate-deploy] Migrations applied successfully.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("[migrate-deploy] Migration failed:", error);
  process.exit(1);
});
