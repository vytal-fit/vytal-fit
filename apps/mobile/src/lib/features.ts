import {
  ORGANIZATION_CONFIGS,
  type OrganizationFeatures,
  type UserRole,
} from "@vytal-fit/shared";

/**
 * Feature-flag + role gating for mobile — mirrors the web (apps/pro,my). The
 * effective feature set is the org VERTICAL's default config merged with the
 * org's saved overrides (orgSettings.features). Screens/tabs gate on a feature
 * flag and/or a minimum role, exactly like the web nav's requiresFeature /
 * requiresRole.
 */

const DEFAULT_TYPE = "crossfit_box";

/** Merge the vertical default features with the org's saved overrides. */
export function resolveFeatures(
  orgType: string | null | undefined,
  overrides?: Partial<OrganizationFeatures> | null,
): OrganizationFeatures {
  const config =
    (orgType && ORGANIZATION_CONFIGS[orgType as keyof typeof ORGANIZATION_CONFIGS]) ||
    ORGANIZATION_CONFIGS[DEFAULT_TYPE as keyof typeof ORGANIZATION_CONFIGS];
  const base = config.features;
  return overrides ? { ...base, ...overrides } : base;
}

export function hasFeature(
  features: OrganizationFeatures,
  flag: keyof OrganizationFeatures,
): boolean {
  return Boolean(features[flag]);
}

/** Role hierarchy: athlete < coach < owner. `min` is the least role required. */
const ROLE_RANK: Record<string, number> = { athlete: 0, coach: 1, owner: 2 };

export function hasRole(role: UserRole | string | null | undefined, min: "athlete" | "coach" | "owner"): boolean {
  return (ROLE_RANK[String(role)] ?? 0) >= (ROLE_RANK[min] ?? 0);
}

/**
 * A screen/tab gate: passes when the feature (if any) is enabled AND the role
 * (if any minimum) is met. Mirrors the web nav item's requiresFeature/requiresRole.
 */
export function canAccess(
  features: OrganizationFeatures,
  role: UserRole | string | null | undefined,
  gate: { requiresFeature?: keyof OrganizationFeatures; requiresRole?: "athlete" | "coach" | "owner" },
): boolean {
  if (gate.requiresFeature && !hasFeature(features, gate.requiresFeature)) return false;
  if (gate.requiresRole && !hasRole(role, gate.requiresRole)) return false;
  return true;
}
