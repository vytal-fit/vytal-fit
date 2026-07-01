import {
  appRouter,
  createCallerFactory,
  createContext,
  extractApiKey,
  resolveApiKeySession,
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

/**
 * Build a caller for the **public REST gateway** (`/v1`). External access is
 * API-key-only: send `Authorization: Bearer vk_live_…`. First-party sessions
 * (cookies / OAuth) are intentionally NOT accepted here — Vytal's own apps talk
 * to tRPC directly. Returns null when no valid, unrevoked key is present.
 */
export async function getApiGatewayCaller(request: Request) {
  if (!isBackendConfigured()) return null;
  const rawKey = extractApiKey(request.headers);
  if (!rawKey) return null;
  const db = getDb();
  const session = await resolveApiKeySession(db, rawKey);
  if (!session) return null;
  return createCaller(createContext({ db, session }));
}
