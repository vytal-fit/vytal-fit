/**
 * tRPC route handler (/api/trpc/*).
 *
 * Bridges Next.js fetch requests to the shared `appRouter` from
 * @vytal-fit/api. The context carries the lazy DB client and the Better Auth
 * session (mapped to the API's `SessionContext` shape). Auth and org
 * isolation rules live in packages/api (protectedProcedure/orgProcedure) —
 * nothing is enforced or bypassed here.
 *
 * Lazy: no env access at module level. When DATABASE_URL/BETTER_AUTH_SECRET
 * are missing, every call fails with a clean SERVICE_UNAVAILABLE TRPCError
 * instead of crashing, and `next build` succeeds without any env vars.
 */
import { TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import {
  appRouter,
  createContext,
  resolveOrgRole,
  type Context,
} from "@vytal-fit/api";
import { getDb } from "@vytal-fit/db";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

async function buildContext(request: Request): Promise<Context> {
  if (!isBackendConfigured()) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Backend is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.",
    });
  }

  const sessionData = await getAuth().api.getSession({
    headers: request.headers,
  });

  const db = getDb();

  if (!sessionData) {
    return createContext({ db, session: null });
  }

  const activeOrganizationId =
    sessionData.session.activeOrganizationId ?? null;

  // Resolve the caller's role in the active org server-side from the Better
  // Auth `member` table (one indexed select). Never client-supplied.
  const role = activeOrganizationId
    ? await resolveOrgRole(db, sessionData.user.id, activeOrganizationId)
    : null;

  return createContext({
    db,
    session: {
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
      },
      activeOrganizationId,
      role,
    },
  });
}

function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => buildContext(request),
  });
}

export { handler as GET, handler as POST };
