import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { gymMembers, memberReferrals } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

const STATUS = z.enum(["pending", "converted", "expired"]);

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const referralsRouter = router({
  /**
   * Org referrals joined with the referrer's member name, newest first.
   */
  list: orgProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: memberReferrals.id,
        referrerName: gymMembers.name,
        referredName: memberReferrals.referredName,
        referredEmail: memberReferrals.referredEmail,
        status: memberReferrals.status,
        rewardApplied: memberReferrals.rewardApplied,
        rewardAmount: memberReferrals.rewardAmount,
        createdAt: memberReferrals.createdAt,
      })
      .from(memberReferrals)
      .innerJoin(gymMembers, eq(gymMembers.id, memberReferrals.referrerMemberId))
      .where(eq(memberReferrals.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(memberReferrals.createdAt));
    return rows;
  }),

  /**
   * Aggregated program metrics + a top-referrers leaderboard, all derived from
   * member_referrals (no stored counters).
   */
  stats: orgProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        referrerName: gymMembers.name,
        status: memberReferrals.status,
        rewardApplied: memberReferrals.rewardApplied,
        rewardAmount: memberReferrals.rewardAmount,
      })
      .from(memberReferrals)
      .innerJoin(gymMembers, eq(gymMembers.id, memberReferrals.referrerMemberId))
      .where(eq(memberReferrals.organizationId, ctx.activeOrganizationId));

    const total = rows.length;
    const converted = rows.filter((r) => r.status === "converted").length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const expired = rows.filter((r) => r.status === "expired").length;
    const rewardsPaid = rows
      .filter((r) => r.rewardApplied)
      .reduce((sum, r) => sum + r.rewardAmount, 0);
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    const byReferrer = new Map<
      string,
      { name: string; referrals: number; converted: number; rewardEarned: number }
    >();
    for (const r of rows) {
      const entry =
        byReferrer.get(r.referrerName) ??
        { name: r.referrerName, referrals: 0, converted: 0, rewardEarned: 0 };
      entry.referrals += 1;
      if (r.status === "converted") entry.converted += 1;
      if (r.rewardApplied) entry.rewardEarned += r.rewardAmount;
      byReferrer.set(r.referrerName, entry);
    }
    const topReferrers = [...byReferrer.values()]
      .sort((a, b) => b.referrals - a.referrals || b.converted - a.converted)
      .slice(0, 5)
      .map((e) => ({ ...e, initials: initialsOf(e.name) }));

    return { total, converted, pending, expired, rewardsPaid, conversionRate, topReferrers };
  }),

  create: staffProcedure
    .input(
      z.object({
        referrerMemberId: z.string().min(1),
        referredName: z.string().min(1).max(160),
        referredEmail: z.string().email(),
        rewardAmount: z.number().int().min(0).max(100000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // The referrer must be a member of the caller's org (no cross-tenant refs).
      const [member] = await ctx.db
        .select({ id: gymMembers.id })
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.referrerMemberId),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "Referrer not found." });

      const [created] = await ctx.db
        .insert(memberReferrals)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          referrerMemberId: input.referrerMemberId,
          referredName: input.referredName,
          referredEmail: input.referredEmail,
          status: "pending",
          rewardApplied: false,
          rewardAmount: input.rewardAmount ?? 0,
        })
        .returning();
      return created;
    }),

  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: STATUS,
        rewardApplied: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(memberReferrals)
        .set({
          status: input.status,
          ...(input.rewardApplied !== undefined ? { rewardApplied: input.rewardApplied } : {}),
        })
        .where(
          and(
            eq(memberReferrals.id, input.id),
            eq(memberReferrals.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Referral not found." });
      return updated;
    }),
});
