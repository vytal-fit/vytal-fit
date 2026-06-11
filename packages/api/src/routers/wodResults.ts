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
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";
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

  // TODO(athlete-self): athletes should log results for THEMSELVES from the
  // athlete app. That requires a user→gym_member linkage (e.g. a
  // `gym_members.user_id` column) which does not exist in the schema yet.
  // Until then create is coach+; relax to any org member with an
  // own-memberId check once the linkage lands.
  create: staffProcedure.input(resultInput).mutation(async ({ ctx, input }) => {
    await assertRefsInOrg(ctx.db, ctx.activeOrganizationId, input);

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

  update: staffProcedure
    .input(z.object({ id: z.string().min(1), data: resultInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: wodResults.id })
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
