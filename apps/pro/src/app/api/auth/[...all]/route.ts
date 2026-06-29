/**
 * Better Auth catch-all route (/auth/* compatibility alias).
 *
 * Lazy: the auth instance (and its DB connection) is only created on the
 * first request, never at module/build time. When the backend env vars are
 * missing, requests get a clean 503 instead of a crash.
 */
import { buildAuthHandler } from "@/lib/auth-route";

export const { GET, POST, PATCH, PUT, DELETE } = buildAuthHandler();
