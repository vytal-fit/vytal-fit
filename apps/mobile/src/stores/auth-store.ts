import { create } from "zustand";
import { mockCurrentUser } from "@vytal-fit/shared";

type UserWithOrgs = typeof mockCurrentUser;

interface AuthState {
  isAuthenticated: boolean;
  user: UserWithOrgs | null;
  activeOrgId: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchOrg: (orgId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  activeOrgId: mockCurrentUser.activeOrganizationId,

  login: (_email: string, _password: string) => {
    // POC: accept any credentials, set mockCurrentUser
    set({
      isAuthenticated: true,
      user: mockCurrentUser,
      activeOrgId: mockCurrentUser.activeOrganizationId,
    });
    return true;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  switchOrg: (orgId: string) => {
    set({ activeOrgId: orgId });
  },
}));
