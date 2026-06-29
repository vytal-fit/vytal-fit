/**
 * Server-side Better Auth instance for the web app.
 *
 * Lazy singleton: nothing reads the environment or connects to PostgreSQL at
 * import time, so `next build` succeeds without DATABASE_URL or
 * BETTER_AUTH_SECRET set. The instance is only built on first use inside a
 * request handler.
 *
 * Server-only — never import this from client components.
 */
import { createAuth, type Auth } from "@vytal-fit/auth";
import { getDb } from "@vytal-fit/db";

let authInstance: Auth | null = null;

/** Whether the env vars required to serve auth/db requests are present. */
export function isBackendConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);
}

/**
 * Returns the Better Auth instance, building it on first call.
 * Throws if DATABASE_URL is missing — callers should gate on
 * `isBackendConfigured()` first to fail with a clean error instead.
 */
export function getAuth(): Auth {
  if (!authInstance) {
    authInstance = createAuth({
      db: getDb(),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,
    });
  }
  return authInstance;
}
