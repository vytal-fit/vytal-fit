/**
 * CLI entry for the database seed — `npm run db:seed -w @vytal-fit/db`.
 *
 * Loads DATABASE_URL / BETTER_AUTH_SECRET from the shell or from .env files
 * (repo root and apps/web, see load-env.ts), builds the real postgres client
 * + Better Auth instance, runs the idempotent `seedDatabase`, and prints a
 * summary. Migrations are assumed to be applied already
 * (`npm run db:migrate -w @vytal-fit/db`).
 */
import { createAuth } from "@vytal-fit/auth";
import { createDb } from "../src/client";
import { DEMO_PASSWORD, DEMO_USERS, seedDatabase } from "../src/seed";
import { loadEnvFiles } from "./load-env";

function fail(message: string): never {
  console.error(`\n[db:seed] ${message}\n`);
  process.exit(1);
}

async function main(): Promise<void> {
  const loaded = loadEnvFiles();
  if (loaded.length > 0) {
    console.log(`[db:seed] env loaded from: ${loaded.join(", ")}`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    fail(
      "DATABASE_URL is not set. Export it or add it to .env.local " +
        "(repo root or apps/web) — e.g. via `npx vercel env pull .env.local`.",
    );
  }
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    fail(
      "BETTER_AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` " +
        "and export it or add it to .env.local.",
    );
  }

  const db = createDb(databaseUrl);
  const auth = createAuth({
    db,
    secret,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  });

  console.log("[db:seed] seeding…");
  const summary = await seedDatabase(db, {
    auth,
    log: (message) => console.log(`  ${message}`),
  });

  const totalInserted = Object.values(summary.inserted).reduce(
    (sum, n) => sum + n,
    0,
  );
  console.log("\n[db:seed] summary");
  for (const [table, n] of Object.entries(summary.inserted)) {
    console.log(`  ${table.padEnd(20)} +${n}`);
  }
  console.log(
    `  total rows inserted: ${totalInserted}` +
      (totalInserted === 0 ? " (database was already seeded — idempotent)" : ""),
  );

  console.log("\n[db:seed] demo accounts (password for all: " + DEMO_PASSWORD + ")");
  for (const spec of DEMO_USERS) {
    const state = summary.demoUsers.find((u) => u.email === spec.email);
    const roles = spec.memberships
      .map((m) => `${m.role}@${m.organizationId}`)
      .join(", ");
    console.log(
      `  ${spec.email.padEnd(20)} ${roles}${state?.created ? "" : " (already existed)"}`,
    );
  }

  // postgres-js keeps sockets open; exit explicitly once seeding is done.
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("[db:seed] failed:", error);
  process.exit(1);
});
