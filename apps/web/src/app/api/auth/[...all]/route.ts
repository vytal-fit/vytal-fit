/**
 * Better Auth catch-all route (/api/auth/*).
 *
 * Lazy: the auth instance (and its DB connection) is only created on the
 * first request, never at module/build time. When the backend env vars are
 * missing, requests get a clean 503 instead of a crash.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(
  async (request: Request): Promise<Response> => {
    if (!isBackendConfigured()) {
      return Response.json(
        {
          error: "SERVICE_UNAVAILABLE",
          message:
            "Auth backend is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.",
        },
        { status: 503 },
      );
    }
    return getAuth().handler(request);
  },
);
