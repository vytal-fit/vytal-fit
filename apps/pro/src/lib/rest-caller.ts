import {
  appRouter,
  createCallerFactory,
  createContext,
  resolveOrgRole,
  type Context,
} from "@vytal-fit/api";
import { getDb } from "@vytal-fit/db";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

const createCaller = createCallerFactory(appRouter);

export async function buildRestContext(request: Request): Promise<Context> {
  if (!isBackendConfigured()) {
    throw new Error("Backend is not configured.");
  }

  const sessionData = await getAuth().api.getSession({
    headers: request.headers,
  });
  const db = getDb();

  if (!sessionData) {
    return createContext({ db, session: null });
  }

  const activeOrganizationId = sessionData.session.activeOrganizationId ?? null;
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

export async function getRestCaller(request: Request) {
  const context = await buildRestContext(request);
  return createCaller(context);
}
