import type { UserWithOrgs } from "../types/user";

/** Default accent colors per organization */
export const mockOrgAccentColors: Record<string, string> = {
  "org-1": "#22c55e", // CrossFit Aveiro — green
  "org-2": "#8b5cf6", // Yoga Flow Porto — purple
  "org-3": "#ef4444", // Iron Temple — red
};

/** Current logged-in user — belongs to 3 organizations with different roles */
export const mockCurrentUser: UserWithOrgs = {
  user: {
    id: "user-1",
    name: "Jose Fonte",
    email: "jcunhafonte@gmail.com",
    phone: "931918000",
    language: "pt",
    createdAt: "2024-01-01",
  },
  memberships: [
    {
      id: "mem-1",
      userId: "user-1",
      organizationId: "org-1",
      role: "owner",
      status: "active",
      memberNumber: 1,
      joinedAt: "2024-01-15",
      organization: {
        id: "org-1",
        name: "CrossFit Aveiro",
        type: "crossfit_box",
        slug: "crossfit-aveiro",
      },
    },
    {
      id: "mem-2",
      userId: "user-1",
      organizationId: "org-2",
      role: "athlete",
      status: "active",
      memberNumber: 42,
      joinedAt: "2025-03-01",
      planId: "plan-1",
      organization: {
        id: "org-2",
        name: "Yoga Flow Porto",
        type: "yoga_studio",
        slug: "yoga-flow-porto",
      },
    },
    {
      id: "mem-3",
      userId: "user-1",
      organizationId: "org-3",
      role: "coach",
      status: "active",
      joinedAt: "2025-06-01",
      coachSpecialty: "Strength & Conditioning",
      organization: {
        id: "org-3",
        name: "Iron Temple",
        type: "weightlifting_club",
        slug: "iron-temple",
      },
    },
  ],
  activeOrganizationId: "org-1",
};
