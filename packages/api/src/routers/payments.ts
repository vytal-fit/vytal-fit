import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import {
  gymMembers,
  payments,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  subscriptionPlans,
} from "@vytal-fit/db";
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

const paymentInput = z.object({
  memberId: z.string().min(1),
  planId: z.string().min(1).optional(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default("EUR"),
  method: z.enum(PAYMENT_METHODS),
  status: z.enum(PAYMENT_STATUSES).default("pending"),
  reference: z.string().max(60).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** `YYYY-MM` bucket for a date. */
function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const paymentsRouter = router({
  /** Org-wide payment ledger with the member name joined. Staff-readable. */
  list: orgProcedure
    .input(
      z
        .object({
          status: z.enum(PAYMENT_STATUSES).optional(),
          memberId: z.string().min(1).optional(),
          limit: z.number().int().min(1).max(500).default(200),
        })
        .default({ limit: 200 }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: payments.id,
          memberId: payments.memberId,
          memberName: gymMembers.name,
          memberEmail: gymMembers.email,
          planId: payments.planId,
          amount: payments.amount,
          currency: payments.currency,
          method: payments.method,
          status: payments.status,
          reference: payments.reference,
          dueDate: payments.dueDate,
          paidAt: payments.paidAt,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .innerJoin(gymMembers, eq(payments.memberId, gymMembers.id))
        .where(
          and(
            eq(payments.organizationId, ctx.activeOrganizationId),
            input.status ? eq(payments.status, input.status) : undefined,
            input.memberId ? eq(payments.memberId, input.memberId) : undefined,
          ),
        )
        .orderBy(desc(payments.createdAt))
        .limit(input.limit);
    }),

  /** A member's payment history. Athletes may read only their own. */
  byMember: orgProcedure
    .input(z.object({ memberId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [member] = await ctx.db
        .select({ id: gymMembers.id, userId: gymMembers.userId })
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.memberId),
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
          message: "Athletes can only read their own payments.",
        });
      }

      return ctx.db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.organizationId, ctx.activeOrganizationId),
            eq(payments.memberId, input.memberId),
          ),
        )
        .orderBy(desc(payments.createdAt));
    }),

  /**
   * Financial dashboard aggregates: 6-month revenue trend, payment-method
   * breakdown, overdue + pending tallies and recent transactions. Staff-only.
   */
  stats: staffProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: payments.id,
        memberName: gymMembers.name,
        memberEmail: gymMembers.email,
        amount: payments.amount,
        method: payments.method,
        status: payments.status,
        reference: payments.reference,
        dueDate: payments.dueDate,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(gymMembers, eq(payments.memberId, gymMembers.id))
      .where(eq(payments.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(payments.createdAt));

    const now = new Date();
    // Last 6 month buckets, oldest first.
    const months: { key: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      months.push({ key: monthKey(d), revenue: 0 });
    }
    const monthIndex = new Map(months.map((m, i) => [m.key, i]));

    const byMethod = new Map<string, number>();
    let currentMonthRevenue = 0;
    let lastMonthRevenue = 0;
    const curKey = monthKey(now);
    const lastKey = monthKey(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
    );

    for (const r of rows) {
      const amount = Number(r.amount);
      if (r.status === "paid") {
        const when = r.paidAt ?? r.createdAt;
        const key = monthKey(new Date(when));
        const idx = monthIndex.get(key);
        if (idx !== undefined) months[idx].revenue += amount;
        if (key === curKey) currentMonthRevenue += amount;
        if (key === lastKey) lastMonthRevenue += amount;
        byMethod.set(r.method, (byMethod.get(r.method) ?? 0) + amount);
      }
    }

    const overdue = rows.filter((r) => r.status === "overdue");
    const pending = rows.filter((r) => r.status === "pending");

    return {
      months,
      byMethod: [...byMethod.entries()].map(([method, total]) => ({ method, total })),
      currentMonthRevenue,
      lastMonthRevenue,
      overdueTotal: overdue.reduce((s, r) => s + Number(r.amount), 0),
      overdueCount: overdue.length,
      pendingCount: pending.length,
      overdue: overdue.slice(0, 20),
      recent: rows.slice(0, 10),
    };
  }),

  /** Register a payment (staff+). */
  create: staffProcedure.input(paymentInput).mutation(async ({ ctx, input }) => {
    const [member] = await ctx.db
      .select({ id: gymMembers.id })
      .from(gymMembers)
      .where(
        and(
          eq(gymMembers.id, input.memberId),
          eq(gymMembers.organizationId, ctx.activeOrganizationId),
        ),
      )
      .limit(1);
    if (!member) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
    }
    if (input.planId) {
      const [plan] = await ctx.db
        .select({ id: subscriptionPlans.id })
        .from(subscriptionPlans)
        .where(
          and(
            eq(subscriptionPlans.id, input.planId),
            eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!plan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found." });
      }
    }

    const [created] = await ctx.db
      .insert(payments)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        memberId: input.memberId,
        planId: input.planId ?? null,
        amount: input.amount.toFixed(2),
        currency: input.currency,
        method: input.method,
        status: input.status,
        reference: input.reference ?? null,
        dueDate: input.dueDate ?? null,
        paidAt: input.status === "paid" ? new Date() : null,
      })
      .returning();
    return created;
  }),

  /** Mark a payment as paid (staff+); stamps `paidAt`. */
  markPaid: staffProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(payments)
        .set({ status: "paid", paidAt: new Date() })
        .where(
          and(
            eq(payments.id, input.id),
            eq(payments.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found." });
      }
      return updated;
    }),
});
