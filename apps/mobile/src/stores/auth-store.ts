import { create } from "zustand";
import {
  type OrgMembership,
  type UserRole,
  type UserWithOrgs,
} from "@vytal-fit/shared";
import {
  fetchSession,
  getFullOrganization,
  listOrganizations,
  persistAuthSnapshot,
  persistAuthToken,
  updateActiveSpace,
  setRuntimeAuthToken,
  signIn,
  signOut,
  signUp,
  loadAuthSnapshot,
  loadAuthToken,
} from "@/lib/auth-api";

const USER_ROLES: readonly UserRole[] = [
  "owner",
  "admin",
  "coach",
  "pt",
  "athlete",
];

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: UserWithOrgs | null;
  activeOrgId: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => Promise<boolean>;
  hydrate: () => Promise<void>;
}

function normalizeRole(role: string): UserRole {
  const first = role.split(",")[0]?.trim() ?? "";
  return (USER_ROLES as readonly string[]).includes(first)
    ? (first as UserRole)
    : "athlete";
}

function parseOrgType(metadata: unknown): string {
  try {
    const value: unknown =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    if (value && typeof value === "object" && "type" in value) {
      const type = (value as Record<string, unknown>).type;
      if (typeof type === "string" && type.length > 0) return type;
    }
  } catch {
    // fall through to default
  }
  return "gym";
}

function toIsoDate(date: string | Date): string {
  return (date instanceof Date ? date : new Date(date)).toISOString();
}

async function buildUserWithOrgs(): Promise<UserWithOrgs | null> {
  const session = await fetchSession();
  if (!session) return null;

  const orgs = await listOrganizations();
  const memberships: UserWithOrgs["memberships"] = [];

  for (const org of orgs) {
    const fullOrg = await getFullOrganization(org.id);
    const member = fullOrg?.members.find(
      (candidate) => Boolean(candidate && candidate.userId === session.user.id),
    );
    if (!member) continue;

    const membership: OrgMembership = {
      id: member.id,
      userId: member.userId,
      organizationId: org.id,
      role: normalizeRole(member.role),
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
  if (!memberships.some((member) => member.organizationId === activeOrganizationId)) {
    activeOrganizationId = memberships[0]?.organizationId ?? "";
    if (activeOrganizationId) {
      await updateActiveSpace(activeOrganizationId);
    }
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      photo: session.user.image ?? undefined,
      language: "pt",
      createdAt: toIsoDate(session.user.createdAt),
    },
    memberships,
    activeOrganizationId,
  };
}

async function restoreSnapshot(): Promise<UserWithOrgs | null> {
  const cached = await loadAuthSnapshot();
  const token = await loadAuthToken();
  if (!token) return cached;

  setRuntimeAuthToken(token);

  try {
    const user = await buildUserWithOrgs();
    if (!user) return null;
    await persistAuthSnapshot(user);
    return user;
  } catch {
    return cached;
  }
}

function currentActiveOrgId(user: UserWithOrgs | null): string {
  return user?.activeOrganizationId ?? "";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  activeOrgId: "",

  login: async (email: string, password: string) => {
    try {
      const { token } = await signIn(email, password);
      if (!token) return false;
      setRuntimeAuthToken(token);

      const user = await buildUserWithOrgs();
      if (!user) return false;

      await persistAuthSnapshot(user);
      set({
        isAuthenticated: true,
        user,
        activeOrgId: currentActiveOrgId(user),
      });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const { token } = await signUp(name, email, password);
      if (!token) return false;
      setRuntimeAuthToken(token);

      const user = await buildUserWithOrgs();
      if (!user) return false;

      await persistAuthSnapshot(user);
      set({
        isAuthenticated: true,
        user,
        activeOrgId: currentActiveOrgId(user),
      });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await signOut();
    await persistAuthSnapshot(null);
    set({
      isAuthenticated: false,
      user: null,
      activeOrgId: "",
    });
  },

  switchOrg: async (orgId: string) => {
    const { user } = get();
    if (!user) return false;

    const isMember = user.memberships.some(
      (membership) => membership.organizationId === orgId,
    );
    if (!isMember) return false;

    try {
      await updateActiveSpace(orgId);
      const updated = { ...user, activeOrganizationId: orgId };
      await persistAuthSnapshot(updated);
      set({
        user: updated,
        activeOrgId: orgId,
      });
      return true;
    } catch {
      return false;
    }
  },

  hydrate: async () => {
    const cached = await loadAuthSnapshot();
    if (cached) {
      set({
        isAuthenticated: true,
        user: cached,
        activeOrgId: cached.activeOrganizationId,
      });
    }

    const restored = await restoreSnapshot();
    if (restored) {
      await persistAuthSnapshot(restored);
      set({
        isAuthenticated: true,
        user: restored,
        activeOrgId: restored.activeOrganizationId,
      });
    } else {
      await persistAuthToken(null);
      await persistAuthSnapshot(null);
      set({
        isAuthenticated: false,
        user: null,
        activeOrgId: "",
      });
    }

    set({ isHydrated: true });
  },
}));
