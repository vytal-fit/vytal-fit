import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { apiKeys } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";
import { generateApiKey } from "../api-keys";
import { recordAudit } from "../audit";

/** Mask a stored key for display: "vk_live_a1b2····9f3c". */
function maskedKey(prefix: string, last4: string): string {
  return `${prefix}····${last4}`;
}

export const apiKeysRouter = router({
  /** List the org's API keys (never the secret — only prefix + last4). */
  list: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(apiKeys.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      masked: maskedKey(r.prefix, r.last4),
      lastUsedAt: r.lastUsedAt,
      revokedAt: r.revokedAt,
      createdAt: r.createdAt,
    }));
  }),

  /**
   * Create a key. The plaintext is returned exactly once — it is never stored
   * and cannot be recovered. Store only the SHA-256 hash.
   */
  create: adminProcedure
    .input(z.object({ name: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      const { key, prefix, last4, hash } = generateApiKey();
      const [created] = await ctx.db
        .insert(apiKeys)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          name: input.name,
          prefix,
          last4,
          keyHash: hash,
          createdBy: ctx.session?.user.id ?? null,
        })
        .returning();
      recordAudit(ctx, {
        action: "settings",
        resource: "API Key",
        details: `Created API key: ${created.name}`,
        expandedDetails: `Prefix: ${prefix}····${last4}`,
      });
      return {
        id: created.id,
        name: created.name,
        /** Shown once. Copy it now: it cannot be retrieved again. */
        key,
        masked: maskedKey(prefix, last4),
        createdAt: created.createdAt,
      };
    }),

  /** Revoke a key (soft delete). Immediately stops authenticating requests. */
  revoke: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [revoked] = await ctx.db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(apiKeys.id, input.id),
            eq(apiKeys.organizationId, ctx.activeOrganizationId),
            isNull(apiKeys.revokedAt),
          ),
        )
        .returning();
      if (!revoked) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found." });
      }
      recordAudit(ctx, {
        action: "settings",
        resource: "API Key",
        details: `Revoked API key: ${revoked.name}`,
      });
      return { id: revoked.id, revokedAt: revoked.revokedAt };
    }),
});
