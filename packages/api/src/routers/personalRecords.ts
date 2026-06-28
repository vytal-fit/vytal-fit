import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { exercises, gymMembers, personalRecords, PR_UNITS } from "@vytal-fit/db";
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";
import type { Context } from "../trpc";

const prInput = z.object({
  memberId: z.string().min(1),
  exerciseId: z.string().min(1),
  value: z.string().min(1).max(60),
  unit: z.enum(PR_UNITS),
  achievedAt: z.date().optional(),
  previousValue: z.string().max(60).optional(),
});

/** Referenced member must belong to the active org (NOT_FOUND, never leak). */
async function assertMemberInOrg(
  db: Context["db"],
  organizationId: string,
  memberId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: gymMembers.id })
    .from(gymMembers)
    .where(and(eq(gymMembers.id, memberId), eq(gymMembers.organizationId, organizationId)))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
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

/** Exercises are a global library — only existence is checked. */
async function assertExerciseExists(
  db: Context["db"],
  exerciseId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Exercise not found." });
  }
}

export const personalRecordsRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          memberId: z.string().min(1).optional(),
          exerciseId: z.string().min(1).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(personalRecords)
        .where(
          and(
            eq(personalRecords.organizationId, ctx.activeOrganizationId),
            input.memberId ? eq(personalRecords.memberId, input.memberId) : undefined,
            input.exerciseId
              ? eq(personalRecords.exerciseId, input.exerciseId)
              : undefined,
            input.cursor ? gt(personalRecords.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(personalRecords.id))
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
        .from(personalRecords)
        .where(
          and(
            eq(personalRecords.id, input.id),
            eq(personalRecords.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personal record not found.",
        });
      }
      return row;
    }),

  create: orgProcedure.input(prInput).mutation(async ({ ctx, input }) => {
    await assertMemberInOrg(ctx.db, ctx.activeOrganizationId, input.memberId);
    await assertCanActOnMember(ctx, input.memberId, "log personal records");
    await assertExerciseExists(ctx.db, input.exerciseId);

    const [created] = await ctx.db
      .insert(personalRecords)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  update: orgProcedure
    .input(z.object({ id: z.string().min(1), data: prInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: personalRecords.id, memberId: personalRecords.memberId })
        .from(personalRecords)
        .where(
          and(
            eq(personalRecords.id, input.id),
            eq(personalRecords.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personal record not found.",
        });
      }
      if (input.data.memberId) {
        await assertMemberInOrg(ctx.db, ctx.activeOrganizationId, input.data.memberId);
      }
      await assertCanActOnMember(
        ctx,
        input.data.memberId ?? existing.memberId,
        "update personal records",
      );
      if (input.data.exerciseId) {
        await assertExerciseExists(ctx.db, input.data.exerciseId);
      }

      const [updated] = await ctx.db
        .update(personalRecords)
        .set(input.data)
        .where(
          and(
            eq(personalRecords.id, input.id),
            eq(personalRecords.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(personalRecords)
        .where(
          and(
            eq(personalRecords.id, input.id),
            eq(personalRecords.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Personal record not found.",
        });
      }
      return deleted;
    }),
});
