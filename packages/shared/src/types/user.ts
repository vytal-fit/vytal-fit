/**
 * User and membership model.
 *
 * A User is an account-level entity (email, password, name).
 * A Membership links a User to an Organization with a specific role.
 * A user can have multiple memberships across different organizations.
 */

export type UserRole = "owner" | "admin" | "coach" | "pt" | "athlete";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  language: "pt" | "en" | "es";
  emailVerified: boolean;
  createdAt: string;
}

export interface OrgMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended" | "invited";
  memberNumber?: number;
  joinedAt: string;
  /** Role-specific data */
  planId?: string;          // athletes
  coachSpecialty?: string;  // coaches/pts
}

export interface UserWithOrgs {
  user: User;
  memberships: Array<OrgMembership & {
    organization: {
      id: string;
      name: string;
      type: string;
      logo?: string;
      slug: string;
    };
  }>;
  activeOrganizationId: string;
}

/**
 * Role hierarchy and permissions.
 * Each role inherits permissions from roles below it.
 *
 * owner > admin > coach > pt > athlete
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 5,
  admin: 4,
  coach: 3,
  pt: 2,
  athlete: 1,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  coach: "Coach",
  pt: "Personal Trainer",
  athlete: "Athlete",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  owner: "#3dff6e",
  admin: "#00d4ff",
  coach: "#c084fc",
  pt: "#ff8c42",
  athlete: "#6b8c72",
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(role: UserRole): boolean {
  return hasMinRole(role, "admin");
}

export function isStaff(role: UserRole): boolean {
  return hasMinRole(role, "pt");
}
