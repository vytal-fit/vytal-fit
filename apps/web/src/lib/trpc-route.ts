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
        emailVerified: sessionData.user.emailVerified,
      },
      activeOrganizationId,
      role,
    },
  });
}

export function createTrpcRouteHandler(endpoint: string) {
  return function handler(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint,
      req: request,
      router: appRouter,
      createContext: () => buildContext(request),
    });
  };
}
