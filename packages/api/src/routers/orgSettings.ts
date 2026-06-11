import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import {
  defaultPublicSite,
  organization,
  organizationSettings,
  type OrganizationBranding,
  type OrganizationPublicSite,
} from "@vytal-fit/db";
import {
  ORGANIZATION_CONFIGS,
  type OrganizationFeatures,
  type OrganizationTerminology,
  type OrganizationTypeConfig,
} from "@vytal-fit/shared";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";
import type { Context } from "../trpc";

// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for the JSONB blobs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Feature flags as an open record of booleans — mirrors the keys of the
 * shared `OrganizationFeatures` interface without re-declaring all 27 flags.
 * Unknown keys are tolerated (forward-compatible with new flags).
 */
const featuresSchema = z.record(z.string(), z.boolean());

const brandingSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #rrggbb hex color."),
  logoUrl: z.string().url().nullable(),
});

const publicSiteSchema = z.object({
  enabled: z.boolean(),
  slogan: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  seo: z
    .object({
      title: z.string().max(120).optional(),
      description: z.string().max(300).optional(),
    })
    .optional(),
  sections: z.record(z.string(), z.boolean()),
  customDomain: z.string().max(253).nullable().optional(),
});

/** Partial terminology overrides (e.g. { member: "Yogi" }). */
const terminologyOverridesSchema = z.record(z.string(), z.string().min(1).max(60));

const updateInput = z.object({
  features: featuresSchema.optional(),
  branding: brandingSchema.partial().optional(),
  publicSite: publicSiteSchema.partial().optional(),
  terminologyOverrides: terminologyOverridesSchema.nullable().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Defaults derived from ORGANIZATION_CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

const VYTAL_GREEN = "#22c55e";

/** Resolve the vertical config for an org type string, falling back to "other". */
function configForType(type: string | null | undefined): OrganizationTypeConfig {
  const config =
    (type ? ORGANIZATION_CONFIGS[type] : undefined) ?? ORGANIZATION_CONFIGS["other"];
  if (!config) {
    // ORGANIZATION_CONFIGS always ships an "other" entry — defensive only.
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Organization type configuration is unavailable.",
    });
  }
  return config;
}

export interface EffectiveSettings {
  organizationId: string;
  features: OrganizationFeatures;
  branding: OrganizationBranding;
  publicSite: OrganizationPublicSite;
  terminologyOverrides: Partial<OrganizationTerminology> | null;
  /** `null` when the org has no settings row yet (pure defaults). */
  updatedAt: Date | null;
}

/**
 * The org's settings row, or sensible defaults derived from the
 * `ORGANIZATION_CONFIGS` entry for the org's type when no row exists.
 */
async function effectiveSettings(
  db: Context["db"],
  organizationId: string,
): Promise<EffectiveSettings> {
  const [row] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, organizationId))
    .limit(1);
  if (row) return row;

  const [org] = await db
    .select({ logo: organization.logo, metadata: organization.metadata })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  let type: string | null = null;
  if (org?.metadata) {
    try {
      const parsed: unknown = JSON.parse(org.metadata);
      if (parsed && typeof parsed === "object" && "type" in parsed) {
        type = typeof parsed.type === "string" ? parsed.type : null;
      }
    } catch {
      // Malformed metadata — fall through to the "other" defaults.
    }
  }
  const config = configForType(type);

  return {
    organizationId,
    features: config.features,
    branding: {
      accentColor: config.accentColor ?? VYTAL_GREEN,
      logoUrl: org?.logo ?? null,
    },
    publicSite: defaultPublicSite(),
    terminologyOverrides: null,
    updatedAt: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const orgSettingsRouter = router({
  get: orgProcedure.query(({ ctx }) =>
    effectiveSettings(ctx.db, ctx.activeOrganizationId),
  ),

  /**
   * Partial update, upserted: blobs are merged key-wise onto the current
   * effective settings (stored row or type defaults), so a first update on an
   * org without a row materializes the defaults plus the patch.
   */
  update: adminProcedure.input(updateInput).mutation(async ({ ctx, input }) => {
    const current = await effectiveSettings(ctx.db, ctx.activeOrganizationId);

    // Merged blobs keep every known key from the defaults — the cast back to
    // the storage types is safe because patches can only flip/append values.
    const features = {
      ...current.features,
      ...input.features,
    } as OrganizationFeatures;
    const branding: OrganizationBranding = { ...current.branding, ...input.branding };
    const publicSite: OrganizationPublicSite = {
      ...current.publicSite,
      ...input.publicSite,
    };
    const terminologyOverrides =
      input.terminologyOverrides === undefined
        ? current.terminologyOverrides
        : (input.terminologyOverrides as Partial<OrganizationTerminology> | null);

    const values = {
      organizationId: ctx.activeOrganizationId,
      features,
      branding,
      publicSite,
      terminologyOverrides,
      updatedAt: new Date(),
    };

    const [saved] = await ctx.db
      .insert(organizationSettings)
      .values(values)
      .onConflictDoUpdate({
        target: organizationSettings.organizationId,
        set: values,
      })
      .returning();
    return saved;
  }),
});
