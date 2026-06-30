import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { gymMembers, personalRecords, PR_UNITS } from "@vytal-fit/db";
import { getExerciseById, hasExercise, hasMinRole } from "@vytal-fit/shared";
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

/** Exercises are a global library backed by the shared catalog. */
async function assertExerciseExists(exerciseId: string): Promise<void> {
  if (!hasExercise(exerciseId)) {
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
      // An athlete may only read their own member's PRs; an org-wide read
      // (no memberId) is staff-only.
      if (input.memberId) {
        await assertCanActOnMember(ctx, input.memberId, "read records");
      } else if (!ctx.session?.role || !hasMinRole(ctx.session.role, "coach")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Staff only." });
      }

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

      const exerciseIds = [...new Set(rows.map((row) => row.exerciseId))];
      const exerciseById = new Map(
        exerciseIds.map((exerciseId) => [exerciseId, getExerciseById(exerciseId) ?? null]),
      );

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return {
        items: rows.map((row) => ({
          ...row,
          exercise: exerciseById.get(row.exerciseId) ?? null,
        })),
        nextCursor,
      };
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
      await assertCanActOnMember(ctx, row.memberId, "read records");

      return {
        ...row,
        exercise: getExerciseById(row.exerciseId) ?? null,
      };
    }),

  create: orgProcedure.input(prInput).mutation(async ({ ctx, input }) => {
    await assertMemberInOrg(ctx.db, ctx.activeOrganizationId, input.memberId);
    await assertCanActOnMember(ctx, input.memberId, "log personal records");
    await assertExerciseExists(input.exerciseId);

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
        await assertExerciseExists(input.data.exerciseId);
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
