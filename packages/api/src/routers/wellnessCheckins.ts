import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { gymMembers, wellnessCheckins } from "@vytal-fit/db";
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";
import type { Context } from "../trpc";

/** 1–10 perceived scale (sleep / fatigue / stress / mood). */
const scale = z.number().int().min(1).max(10);
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const upsertInput = z.object({
  memberId: z.string().min(1),
  date: ymd.optional(),
  sleep: scale.optional(),
  fatigue: scale.optional(),
  stress: scale.optional(),
  mood: scale.optional(),
  notes: z.string().max(2000).optional(),
});

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

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
      message: "Athletes can only log a check-in for their own member profile.",
    });
  }
}

export const wellnessCheckinsRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          memberId: z.string().min(1).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(wellnessCheckins)
        .where(
          and(
            eq(wellnessCheckins.organizationId, ctx.activeOrganizationId),
            input.memberId ? eq(wellnessCheckins.memberId, input.memberId) : undefined,
            input.cursor ? gt(wellnessCheckins.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(wellnessCheckins.id))
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
        .from(wellnessCheckins)
        .where(
          and(
            eq(wellnessCheckins.id, input.id),
            eq(wellnessCheckins.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Check-in not found." });
      }
      return row;
    }),

  /** The member's check-in for a given day (defaults to today), or null. */
  forDay: orgProcedure
    .input(z.object({ memberId: z.string().min(1), date: ymd.optional() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(wellnessCheckins)
        .where(
          and(
            eq(wellnessCheckins.organizationId, ctx.activeOrganizationId),
            eq(wellnessCheckins.memberId, input.memberId),
            eq(wellnessCheckins.date, input.date ?? todayYmd()),
          ),
        )
        .limit(1);
      return row ?? null;
    }),

  /** Create or update the member's check-in for the day (one per member per day). */
  upsert: orgProcedure.input(upsertInput).mutation(async ({ ctx, input }) => {
    await assertCanActOnMember(ctx, input.memberId);
    const { memberId, date, ...metrics } = input;
    const day = date ?? todayYmd();

    const [row] = await ctx.db
      .insert(wellnessCheckins)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        memberId,
        date: day,
        ...metrics,
      })
      .onConflictDoUpdate({
        target: [
          wellnessCheckins.organizationId,
          wellnessCheckins.memberId,
          wellnessCheckins.date,
        ],
        set: { ...metrics, updatedAt: new Date() },
      })
      .returning();
    return row;
  }),
});
