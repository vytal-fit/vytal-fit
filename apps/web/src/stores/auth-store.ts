/**
 * Auth store backed by real Better Auth sessions.
 *
 * The session itself lives in Better Auth HTTP-only cookies — nothing
 * sensitive is persisted here. localStorage only caches the derived
 * `UserWithOrgs` snapshot so `hydrate()` can paint instantly; the cache is
 * always revalidated against `authClient.getSession()` and cleared when the
 * session is gone.
 */
import { create } from "zustand";
import type { OrgMembership, UserRole, UserWithOrgs } from "@vytal-fit/shared";
import { STORAGE_KEYS } from "@vytal-fit/shared";
import { getAuthUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";

const AUTH_STORAGE_KEY = STORAGE_KEYS.auth;

const USER_ROLES: readonly UserRole[] = [
  "owner",
  "admin",
  "coach",
  "pt",
  "athlete",
];

interface AuthState {
  isAuthenticated: boolean;
  user: UserWithOrgs | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchOrg: (orgId: string) => void;
  hydrate: () => void;
}

function persistAuth(user: UserWithOrgs | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function loadAuth(): UserWithOrgs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserWithOrgs;
  } catch {
    return null;
  }
}

function setOrgSlugCookie(user: UserWithOrgs) {
  const activeOrg = user.memberships.find(
    (m) => m.organizationId === user.activeOrganizationId
  );
  const slug = activeOrg?.organization.slug ?? "";
  if (slug && typeof document !== "undefined") {
    document.cookie = `vytal-org-slug=${slug};path=/;max-age=${60 * 60 * 24 * 365}`;
  }
}

function clearOrgSlugCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "vytal-org-slug=;path=/;max-age=0";
  }
}

/** Better Auth can store comma-separated roles; map to our UserRole union. */
function toUserRole(role: string): UserRole {
  const first = role.split(",")[0]?.trim() ?? "";
  return (USER_ROLES as readonly string[]).includes(first)
    ? (first as UserRole)
    : "athlete";
}

/** Org `type` is stored as JSON in the Better Auth organization metadata. */
function parseOrgType(metadata: unknown): string {
  try {
    const value: unknown =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    if (value && typeof value === "object" && "type" in value) {
      const type = (value as Record<string, unknown>).type;
      if (typeof type === "string" && type.length > 0) return type;
    }
  } catch {
    // malformed metadata — fall through to default
  }
  return "gym";
}

function toIsoDate(date: Date | string): string {
  return (date instanceof Date ? date : new Date(date)).toISOString();
}

interface FullOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: unknown;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    createdAt: Date | string;
  }>;
}

async function fetchFullOrganization(
  organizationId: string,
): Promise<FullOrganizationResponse | null> {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(
    `${getAuthUrl("/organization/get-full-organization")}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch organization ${organizationId}`);
  }
  return (await response.json()) as FullOrganizationResponse | null;
}

/**
 * Build the `UserWithOrgs` shape consumed by the app from the live Better
 * Auth session + organization plugin endpoints.
 *
 * Returns `null` when there is no session (signed out). Throws when the
 * backend cannot be reached, so callers can keep cached state on transient
 * failures instead of logging the user out.
 */
async function buildUserWithOrgs(): Promise<UserWithOrgs | null> {
  const { data: session, error: sessionError } = await authClient.getSession();
  if (sessionError) {
    throw new Error(sessionError.message ?? "Failed to fetch session");
  }
  if (!session) return null;

  const { data: orgs, error: orgsError } = await authClient.organization.list();
  if (orgsError) {
    throw new Error(orgsError.message ?? "Failed to list organizations");
  }

  const memberships: UserWithOrgs["memberships"] = [];
  for (const org of orgs ?? []) {
    const fullOrg = await fetchFullOrganization(org.id);
    const member = fullOrg?.members.find((m) => m.userId === session.user.id);
    if (!member) continue;

    const membership: OrgMembership = {
      id: member.id,
      userId: member.userId,
      organizationId: org.id,
      role: toUserRole(member.role),
      status: "active",
      joinedAt: toIsoDate(member.createdAt),
    };
    memberships.push({
      ...membership,
      organization: {
        id: org.id,
        name: org.name,
        type: parseOrgType(org.metadata),
        logo: org.logo ?? undefined,
        slug: org.slug,
      },
    });
  }

  let activeOrganizationId = session.session.activeOrganizationId ?? "";
  const hasActiveMembership = memberships.some(
    (m) => m.organizationId === activeOrganizationId
  );
  if (!hasActiveMembership && memberships.length > 0) {
    activeOrganizationId = memberships[0].organizationId;
    await authClient.organization.setActive({
      organizationId: activeOrganizationId,
    });
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      photo: session.user.image ?? undefined,
      language: "pt",
      emailVerified: session.user.emailVerified ?? false,
      createdAt: toIsoDate(session.user.createdAt),
    },
    memberships,
    activeOrganizationId,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,

  login: async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) return false;

    try {
      const user = await buildUserWithOrgs();
      if (!user) return false;
      persistAuth(user);
      setOrgSlugCookie(user);
      set({ isAuthenticated: true, user });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) return false;

    try {
      const user = await buildUserWithOrgs();
      if (!user) return false;
      persistAuth(user);
      setOrgSlugCookie(user);
      set({ isAuthenticated: true, user });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    void authClient.signOut();
    persistAuth(null);
    clearOrgSlugCookie();
    set({ isAuthenticated: false, user: null });
  },

  switchOrg: (orgId: string) => {
    const { user } = get();
    if (!user) return;
    const isMember = user.memberships.some((m) => m.organizationId === orgId);
    if (!isMember) return;

    void authClient.organization.setActive({ organizationId: orgId });
    const updated = { ...user, activeOrganizationId: orgId };
    persistAuth(updated);
    setOrgSlugCookie(updated);
    set({ user: updated });
  },

  hydrate: () => {
    // 1. Paint instantly from the cached snapshot (non-sensitive, derived).
    const cached = loadAuth();
    if (cached) {
      setOrgSlugCookie(cached);
      set({ isAuthenticated: true, user: cached });
    }

    // 2. Revalidate against the real Better Auth session cookie.
    void (async () => {
      try {
        const user = await buildUserWithOrgs();
        if (user) {
          persistAuth(user);
          setOrgSlugCookie(user);
          set({ isAuthenticated: true, user });
        } else {
          // Session is gone — clear the stale cache and sign out locally.
          persistAuth(null);
          clearOrgSlugCookie();
          set({ isAuthenticated: false, user: null });
        }
      } catch {
        // Backend unreachable — keep whatever state we had rather than
        // bouncing the user to /login on a transient failure.
      }
    })();
  },
}));
