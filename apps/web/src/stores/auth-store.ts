import { create } from "zustand";
import type { UserWithOrgs } from "@vytal-fit/shared";
import { mockCurrentUser } from "@vytal-fit/shared";

const AUTH_STORAGE_KEY = "vytal-auth";

interface AuthState {
  isAuthenticated: boolean;
  user: UserWithOrgs | null;
  login: (email: string, password: string) => boolean;
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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: (_email: string, _password: string) => {
    const user = { ...mockCurrentUser };
    persistAuth(user);
    setOrgSlugCookie(user);
    set({ isAuthenticated: true, user });
    return true;
  },

  logout: () => {
    persistAuth(null);
    clearOrgSlugCookie();
    set({ isAuthenticated: false, user: null });
  },

  switchOrg: (orgId: string) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, activeOrganizationId: orgId };
      persistAuth(updated);
      setOrgSlugCookie(updated);
      return { user: updated };
    });
  },

  hydrate: () => {
    const user = loadAuth();
    if (user) {
      setOrgSlugCookie(user);
      set({ isAuthenticated: true, user });
    }
  },
}));
