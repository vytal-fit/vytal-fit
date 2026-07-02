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
 * Build a caller for the **public REST API** (`/v1`) — the single, standards-
 * based surface every consumer uses. Authentication is on the `Authorization`
 * header, with two credential types:
 *   • Partners  → `Bearer vk_live_…` (API key)          → resolveApiKeySession
 *   • Internal  → `Bearer <session token>` / cookie     → Better Auth session
 * (Vytal's own web/mobile apps may also use the typed tRPC client to the same
 * procedures — that's the internal transport; this REST surface is the public
 * contract and dog-foods the identical backend.) Returns null (→ 401) only when
 * neither a valid key nor an authenticated session is present. Per-procedure
 * gates (email-verified, org, role) still apply inside the router.
 */
export async function getApiGatewayCaller(request: Request) {
  if (!isBackendConfigured()) return null;

  // Partner path: a vk_live_ API key on the Authorization header.
  const rawKey = extractApiKey(request.headers);
  if (rawKey) {
    const db = getDb();
    const session = await resolveApiKeySession(db, rawKey);
    if (!session) return null;
    return createCaller(createContext({ db, session }));
  }

  // First-party path: OAuth2 / Better Auth session (bearer token or cookie).
  const context = await buildRestContext(request);
  if (!context.session) return null;
  return createCaller(context);
}
