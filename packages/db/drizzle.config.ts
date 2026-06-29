import { defineConfig } from "drizzle-kit";
import { loadEnvFiles } from "./scripts/load-env";

// Fill DATABASE_URL from .env files (repo root / apps/pro) when the shell
// doesn't provide it — lets `db:migrate`/`db:push` run right after
// `npx vercel env pull .env.local`. Shell env always wins.
loadEnvFiles();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  // DATABASE_URL is only required for push/studio — `generate` works offline.
  ...(process.env.DATABASE_URL
    ? { dbCredentials: { url: process.env.DATABASE_URL } }
    : {}),
});
