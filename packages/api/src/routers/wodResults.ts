import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, inArray } from "drizzle-orm";
import {
  classes,
  gymMembers,
  wodResults,
  wods,
  WOD_SCALES,
  WOD_SCORE_TYPES,
} from "@vytal-fit/db";
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";
import type { Context } from "../trpc";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const resultInput = z.object({
  wodId: z.string().min(1),
  memberId: z.string().min(1),
  classId: z.string().min(1).optional(),
  score: z.string().min(1).max(120),
  scoreType: z.enum(WOD_SCORE_TYPES),
  scale: z.enum(WOD_SCALES).default("rx"),
  isPR: z.boolean().default(false),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

/** Referenced rows must belong to the active org (NOT_FOUND, never leak). */
async function assertRefsInOrg(
  db: Context["db"],
  organizationId: string,
  refs: { memberId?: string; wodId?: string; classId?: string },
): Promise<void> {
  if (refs.memberId) {
    const [row] = await db
      .select({ id: gymMembers.id })
      .from(gymMembers)
      .where(
        and(eq(gymMembers.id, refs.memberId), eq(gymMembers.organizationId, organizationId)),
      )
      .limit(1);
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
    }
  }
  if (refs.wodId) {
    const [row] = await db
      .select({ id: wods.id })
      .from(wods)
      .where(and(eq(wods.id, refs.wodId), eq(wods.organizationId, organizationId)))
      .limit(1);
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "WOD not found." });
    }
  }
  if (refs.classId) {
    const [row] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.id, refs.classId), eq(classes.organizationId, organizationId)))
      .limit(1);
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
    }
  }
}

async function assertCanActOnMember(
  ctx: Context & { activeOrganizationId: string },
  memberId: string,
  action: string,
): Promise<void> {
  const [member] = await ctx.db
    .select({ id: gymMembers.id, userId: gymMembers.userId })
    .from(gymMembers)
    .where(
      and(
        eq(gymMembers.id, memberId),
        eq(gymMembers.organizationId, ctx.activeOrganizationId),
      ),
    )
    .limit(1);
  if (!member) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
  }
  if (
    !ctx.session?.role ||
    (!hasMinRole(ctx.session.role, "coach") && member.userId !== ctx.session.user.id)
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Athletes can only ${action} for their own member profile.`,
    });
  }
}

export const wodResultsRouter = router({
  /**
   * Results, optionally filtered by wod, member and/or WOD date.
   * (`wod_results` has no date column — the date filter resolves through the
   * org's WODs on that date.)
   */
  list: orgProcedure
    .input(
      z
        .object({
          wodId: z.string().min(1).optional(),
          memberId: z.string().min(1).optional(),
          date: dateString.optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(wodResults)
        .where(
          and(
            eq(wodResults.organizationId, ctx.activeOrganizationId),
            input.wodId ? eq(wodResults.wodId, input.wodId) : undefined,
            input.memberId ? eq(wodResults.memberId, input.memberId) : undefined,
            input.date
              ? inArray(
                  wodResults.wodId,
                  ctx.db
                    .select({ id: wods.id })
                    .from(wods)
                    .where(
                      and(
                        eq(wods.organizationId, ctx.activeOrganizationId),
                        eq(wods.date, input.date),
                      ),
                    ),
                )
              : undefined,
            input.cursor ? gt(wodResults.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(wodResults.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  create: orgProcedure.input(resultInput).mutation(async ({ ctx, input }) => {
    await assertRefsInOrg(ctx.db, ctx.activeOrganizationId, input);
    await assertCanActOnMember(ctx, input.memberId, "log WOD results");

    const [created] = await ctx.db
      .insert(wodResults)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  update: orgProcedure
    // Strip defaults before .partial() — zod applies .default() even for
    // omitted keys in a partial, silently resetting scale to "rx" and isPR.
    .input(
      z.object({
        id: z.string().min(1),
        data: resultInput
          .extend({ scale: z.enum(WOD_SCALES), isPR: z.boolean() })
          .partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: wodResults.id, memberId: wodResults.memberId })
        .from(wodResults)
        .where(
          and(
            eq(wodResults.id, input.id),
            eq(wodResults.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "WOD result not found." });
      }
      await assertRefsInOrg(ctx.db, ctx.activeOrganizationId, input.data);
      await assertCanActOnMember(
        ctx,
        input.data.memberId ?? existing.memberId,
        "update WOD results",
      );

      const [updated] = await ctx.db
        .update(wodResults)
        .set(input.data)
        .where(
          and(
            eq(wodResults.id, input.id),
            eq(wodResults.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(wodResults)
        .where(
          and(
            eq(wodResults.id, input.id),
            eq(wodResults.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "WOD result not found." });
      }
      return deleted;
    }),
});
