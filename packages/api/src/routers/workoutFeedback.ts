import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { gymMembers, workoutFeedback } from "@vytal-fit/db";
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";
import type { Context } from "../trpc";

/** 1–9 perceived scale (Adenda 01 / D1). */
const scale = z.number().int().min(1).max(9);

const feedbackInput = z.object({
  memberId: z.string().min(1),
  classId: z.string().min(1).optional(),
  wodId: z.string().min(1).optional(),
  rpe: scale.optional(),
  enjoyment: scale.optional(),
  injuryLimitation: scale.optional(),
  notes: z.string().max(2000).optional(),
});

/**
 * The referenced member must belong to the active org, and a non-staff caller
 * may only act on the member linked to their own user account (self-service).
 * 404 for a missing/cross-org member; FORBIDDEN for someone else's member.
 */
async function assertCanActOnMember(
  ctx: Context & { activeOrganizationId: string },
  memberId: string,
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
      message: "Athletes can only log feedback for their own member profile.",
    });
  }
}

export const workoutFeedbackRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          memberId: z.string().min(1).optional(),
          classId: z.string().min(1).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      // Health-adjacent (RGPD): athletes read only their own member's feedback;
      // an org-wide read (no memberId) is staff-only.
      if (input.memberId) {
        await assertCanActOnMember(ctx, input.memberId);
      } else if (!ctx.session?.role || !hasMinRole(ctx.session.role, "coach")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Staff only." });
      }

      const rows = await ctx.db
        .select()
        .from(workoutFeedback)
        .where(
          and(
            eq(workoutFeedback.organizationId, ctx.activeOrganizationId),
            input.memberId ? eq(workoutFeedback.memberId, input.memberId) : undefined,
            input.classId ? eq(workoutFeedback.classId, input.classId) : undefined,
            input.cursor ? gt(workoutFeedback.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(workoutFeedback.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(workoutFeedback)
        .where(
          and(
            eq(workoutFeedback.id, input.id),
            eq(workoutFeedback.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Feedback not found." });
      }
      await assertCanActOnMember(ctx, row.memberId);
      return row;
    }),

  create: orgProcedure.input(feedbackInput).mutation(async ({ ctx, input }) => {
    await assertCanActOnMember(ctx, input.memberId);

    const [created] = await ctx.db
      .insert(workoutFeedback)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),
});
