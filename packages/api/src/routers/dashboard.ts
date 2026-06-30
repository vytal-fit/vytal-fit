import { and, count, eq, gte, inArray, isNotNull, lt, lte, or } from "drizzle-orm";
import {
  bookings,
  classes,
  gymMembers,
  personalRecords,
  subscriptions,
  subscriptionPlans,
} from "@vytal-fit/db";
import { orgProcedure, router } from "../trpc";

/** Local YYYY-MM-DD for a date. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Normalise a plan price to a monthly-recurring value by billing period. */
function monthlyValue(type: string, price: number): number {
  switch (type) {
    case "quarterly":
      return price / 3;
    case "semester":
      return price / 6;
    case "annual":
      return price / 12;
    default:
      return price; // monthly / drop-in / other
  }
}

const ENROLLED = ["confirmed", "checked_in"] as const;

export const dashboardRouter = router({
  stats: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const now = new Date();
    const today = ymd(now);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfNextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [[totalMembers], [activeMembers], [classesToday], [bookingsToday]] = await Promise.all([
      ctx.db.select({ value: count() }).from(gymMembers).where(eq(gymMembers.organizationId, org)),
      ctx.db
        .select({ value: count() })
        .from(gymMembers)
        .where(and(eq(gymMembers.organizationId, org), eq(gymMembers.status, "active"))),
      ctx.db
        .select({ value: count() })
        .from(classes)
        .where(and(eq(classes.organizationId, org), eq(classes.date, today))),
      ctx.db
        .select({ value: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, org),
            gte(bookings.bookedAt, startOfDay),
            lt(bookings.bookedAt, startOfNextDay),
          ),
        ),
    ]);

    // Monthly recurring revenue from active subscriptions, normalised by period.
    const subRows = await ctx.db
      .select({ type: subscriptionPlans.type, price: subscriptionPlans.price })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(eq(subscriptions.organizationId, org), eq(subscriptions.status, "active")));
    const monthlyRevenue = Math.round(
      subRows.reduce((s, r) => s + monthlyValue(r.type, Number(r.price)), 0),
    );

    // Today's occupancy: enrolled bookings vs total capacity of today's classes.
    const todayClasses = await ctx.db
      .select({ id: classes.id, cap: classes.maxCapacity })
      .from(classes)
      .where(and(eq(classes.organizationId, org), eq(classes.date, today)));
    const capacityToday = todayClasses.reduce((s, c) => s + c.cap, 0);
    let enrolledToday = 0;
    if (todayClasses.length) {
      const [row] = await ctx.db
        .select({ value: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, org),
            inArray(bookings.classId, todayClasses.map((c) => c.id)),
            inArray(bookings.status, [...ENROLLED]),
          ),
        );
      enrolledToday = row?.value ?? 0;
    }
    const occupancyPercent = capacityToday > 0 ? Math.round((enrolledToday / capacityToday) * 100) : 0;

    // Retention / billing / activity aggregates.
    const monthStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
    const [[inactiveMembers], [newMembersThisMonth], [prsToday], [atRiskMembers], [pendingPayments]] =
      await Promise.all([
        ctx.db
          .select({ value: count() })
          .from(gymMembers)
          .where(and(eq(gymMembers.organizationId, org), eq(gymMembers.status, "inactive"))),
        ctx.db
          .select({ value: count() })
          .from(gymMembers)
          .where(and(eq(gymMembers.organizationId, org), gte(gymMembers.joinedAt, new Date(monthStart)))),
        ctx.db
          .select({ value: count() })
          .from(personalRecords)
          .where(
            and(
              eq(personalRecords.organizationId, org),
              gte(personalRecords.achievedAt, startOfDay),
              lt(personalRecords.achievedAt, startOfNextDay),
            ),
          ),
        ctx.db
          .select({ value: count() })
          .from(gymMembers)
          .where(
            and(
              eq(gymMembers.organizationId, org),
              eq(gymMembers.status, "active"),
              lte(gymMembers.streakWeeks, 1),
              isNotNull(gymMembers.lastCheckIn),
            ),
          ),
        ctx.db
          .select({ value: count() })
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.organizationId, org),
              or(eq(subscriptions.status, "expired"), lte(subscriptions.nextBillingDate, today)),
            ),
          ),
      ]);

    const total = totalMembers?.value ?? 0;
    const inactive = inactiveMembers?.value ?? 0;
    const churnRate = total > 0 ? Math.round((inactive / total) * 1000) / 10 : 0;

    return {
      totalMembers: total,
      activeMembers: activeMembers?.value ?? 0,
      inactiveMembers: inactive,
      classesToday: classesToday?.value ?? 0,
      bookingsToday: bookingsToday?.value ?? 0,
      monthlyRevenue,
      occupancyPercent,
      churnRate,
      atRiskMembers: atRiskMembers?.value ?? 0,
      pendingPayments: pendingPayments?.value ?? 0,
      newMembersThisMonth: newMembersThisMonth?.value ?? 0,
      prsToday: prsToday?.value ?? 0,
    };
  }),

  /** Occupancy % per day for the last 7 days (enrolled vs capacity). */
  occupancyByDay: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const now = new Date();
    const from = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const to = ymd(now);

    const cls = await ctx.db
      .select({ id: classes.id, date: classes.date, cap: classes.maxCapacity })
      .from(classes)
      .where(and(eq(classes.organizationId, org), gte(classes.date, from), lte(classes.date, to)));

    const capByDate = new Map<string, number>();
    const classDate = new Map<string, string>();
    for (const c of cls) {
      capByDate.set(c.date, (capByDate.get(c.date) ?? 0) + c.cap);
      classDate.set(c.id, c.date);
    }

    const enrolledByDate = new Map<string, number>();
    if (cls.length) {
      const bks = await ctx.db
        .select({ classId: bookings.classId, status: bookings.status })
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, org),
            inArray(bookings.classId, cls.map((c) => c.id)),
            inArray(bookings.status, [...ENROLLED]),
          ),
        );
      for (const b of bks) {
        const d = classDate.get(b.classId);
        if (d) enrolledByDate.set(d, (enrolledByDate.get(d) ?? 0) + 1);
      }
    }

    const days: { date: string; occupancy: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
      const cap = capByDate.get(d) ?? 0;
      const enrolled = enrolledByDate.get(d) ?? 0;
      days.push({ date: d, occupancy: cap > 0 ? Math.round((enrolled / cap) * 100) : 0 });
    }
    return days;
  }),
});
