import { and, count, eq, gte, inArray, isNotNull, lt, lte, or } from "drizzle-orm";
import {
  bookings,
  checkIns,
  classes,
  classTypes,
  gymMembers,
  leads,
  payments,
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

  /**
   * Chart datasets for the dashboard + analytics screens, all derived from real
   * data: member growth (12 mo), revenue (6 mo), attendance heatmap (weekday ×
   * hour) and class-type distribution.
   */
  charts: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const now = new Date();
    const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const [members, pays, checks, bks, cts] = await Promise.all([
      ctx.db
        .select({ joinedAt: gymMembers.joinedAt, status: gymMembers.status })
        .from(gymMembers)
        .where(eq(gymMembers.organizationId, org)),
      ctx.db
        .select({ amount: payments.amount, status: payments.status, paidAt: payments.paidAt, createdAt: payments.createdAt })
        .from(payments)
        .where(eq(payments.organizationId, org)),
      ctx.db
        .select({ checkedInAt: checkIns.checkedInAt })
        .from(checkIns)
        .where(eq(checkIns.organizationId, org)),
      ctx.db
        .select({ classId: bookings.classId, status: bookings.status })
        .from(bookings)
        .where(and(eq(bookings.organizationId, org), inArray(bookings.status, [...ENROLLED]))),
      ctx.db
        .select({ id: classTypes.id, name: classTypes.name, color: classTypes.color })
        .from(classTypes)
        .where(eq(classTypes.organizationId, org)),
    ]);

    // ── Member growth: cumulative joined per month (last 12), + currently-active subset ──
    const memberGrowth: { month: string; total: number; active: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i + 1, 1); // first day after the bucket month
      const total = members.filter((m) => new Date(m.joinedAt) < ref).length;
      const active = members.filter(
        (m) => new Date(m.joinedAt) < ref && m.status === "active",
      ).length;
      const label = MONTHS[new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth()];
      memberGrowth.push({ month: label, total, active });
    }

    // ── Revenue per month (last 6), paid only ──
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const revenue = pays
        .filter((p) => {
          if (p.status !== "paid") return false;
          const when = new Date(p.paidAt ?? p.createdAt);
          return when >= d && when < next;
        })
        .reduce((s, p) => s + Number(p.amount), 0);
      revenueByMonth.push({ month: MONTHS[d.getMonth()], revenue: Math.round(revenue) });
    }

    // ── Attendance heatmap: weekday (Mon..Sun) × hour (6..21) ──
    const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00..21:00
    const heatmap: number[][] = Array.from({ length: 7 }, () => HOURS.map(() => 0));
    for (const c of checks) {
      const dt = new Date(c.checkedInAt);
      const weekday = (dt.getDay() + 6) % 7; // Mon=0
      const hourIdx = dt.getHours() - 6;
      if (hourIdx >= 0 && hourIdx < HOURS.length) heatmap[weekday][hourIdx] += 1;
    }

    // ── Class-type distribution from active bookings ──
    const ctById = new Map(cts.map((c) => [c.id, c]));
    const classTypeIdByClass = new Map<string, string | null>();
    if (bks.length) {
      const clsRows = await ctx.db
        .select({ id: classes.id, classTypeId: classes.classTypeId })
        .from(classes)
        .where(eq(classes.organizationId, org));
      for (const c of clsRows) classTypeIdByClass.set(c.id, c.classTypeId);
    }
    const distCount = new Map<string, number>();
    for (const b of bks) {
      const ctId = classTypeIdByClass.get(b.classId);
      if (ctId) distCount.set(ctId, (distCount.get(ctId) ?? 0) + 1);
    }
    const classDistribution = [...distCount.entries()]
      .map(([id, value]) => ({
        name: ctById.get(id)?.name ?? "Outro",
        value,
        color: ctById.get(id)?.color ?? "#6b8c72",
      }))
      .sort((a, b) => b.value - a.value);

    return {
      memberGrowth,
      revenueByMonth,
      heatmap,
      hours: HOURS,
      classDistribution,
    };
  }),

  /**
   * Member + funnel analytics derived from real data: gender split, age bands,
   * plan mix, the lead → subscriber funnel, and revenue-per-member trend.
   */
  analytics: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const now = new Date();
    const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const [members, subs, plans, leadRows, pays] = await Promise.all([
      ctx.db
        .select({ gender: gymMembers.gender, dob: gymMembers.dateOfBirth, status: gymMembers.status })
        .from(gymMembers)
        .where(eq(gymMembers.organizationId, org)),
      ctx.db
        .select({ planId: subscriptions.planId, status: subscriptions.status })
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, org)),
      ctx.db
        .select({ id: subscriptionPlans.id, name: subscriptionPlans.name })
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.organizationId, org)),
      ctx.db
        .select({ stage: leads.stage })
        .from(leads)
        .where(eq(leads.organizationId, org)),
      ctx.db
        .select({ amount: payments.amount, status: payments.status, paidAt: payments.paidAt, createdAt: payments.createdAt })
        .from(payments)
        .where(eq(payments.organizationId, org)),
    ]);

    // Gender split
    const male = members.filter((m) => m.gender === "male").length;
    const female = members.filter((m) => m.gender === "female").length;
    const other = members.length - male - female;
    const genderDistribution = [
      { name: "Masculino", value: male, color: "#00d4ff" },
      { name: "Feminino", value: female, color: "#c084fc" },
      ...(other > 0 ? [{ name: "Outro", value: other, color: "#6b8c72" }] : []),
    ].filter((g) => g.value > 0);

    // Age bands
    const bands = [
      { age: "18-24", min: 18, max: 24 },
      { age: "25-34", min: 25, max: 34 },
      { age: "35-44", min: 35, max: 44 },
      { age: "45-54", min: 45, max: 54 },
      { age: "55+", min: 55, max: 200 },
    ];
    const ages = members
      .map((m) => (m.dob ? Math.floor((now.getTime() - new Date(m.dob).getTime()) / 31557600000) : null))
      .filter((a): a is number => a !== null && a >= 0 && a < 120);
    const ageDistribution = bands.map((b) => {
      const n = ages.filter((a) => a >= b.min && a <= b.max).length;
      return { age: b.age, pct: ages.length ? Math.round((n / ages.length) * 100) : 0 };
    });

    // Plan mix (active subscriptions)
    const planName = new Map(plans.map((p) => [p.id, p.name]));
    const planColors = ["#22c55e", "#00d4ff", "#ffb300", "#c084fc", "#ff8c42", "#6b8c72"];
    const planCount = new Map<string, number>();
    for (const sub of subs) {
      if (sub.status !== "active" && sub.status !== "paused") continue;
      const nm = planName.get(sub.planId) ?? "Outro";
      planCount.set(nm, (planCount.get(nm) ?? 0) + 1);
    }
    const planDistribution = [...planCount.entries()].map(([name, value], i) => ({
      name,
      value,
      color: planColors[i % planColors.length],
    }));

    // Lead funnel
    const stageCount = (s: string) => leadRows.filter((l) => l.stage === s).length;
    const totalLeads = leadRows.length || 1;
    const funnelDefs = [
      { label: "Leads", stages: ["lead", "contacted", "prospect", "trial_booked", "subscribed"], color: "#ffb300" },
      { label: "Contactados", stages: ["contacted", "prospect", "trial_booked", "subscribed"], color: "#ff8c42" },
      { label: "Trial", stages: ["trial_booked", "subscribed"], color: "#22c55e" },
      { label: "Subscritos", stages: ["subscribed"], color: "#00d4ff" },
    ];
    const leadFunnel = funnelDefs.map((f) => {
      const count = f.stages.reduce((s, st) => s + stageCount(st), 0);
      return { label: f.label, count, pct: Math.round((count / totalLeads) * 100), color: f.color };
    });

    // Revenue per member (last 6 months): paid revenue / current active members
    const activeMembers = members.filter((m) => m.status === "active").length || 1;
    const revenuePerMember: { month: string; rpm: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const rev = pays
        .filter((p) => {
          if (p.status !== "paid") return false;
          const when = new Date(p.paidAt ?? p.createdAt);
          return when >= d && when < next;
        })
        .reduce((s, p) => s + Number(p.amount), 0);
      revenuePerMember.push({ month: MONTHS[d.getMonth()], rpm: Math.round((rev / activeMembers) * 10) / 10 });
    }

    return { genderDistribution, ageDistribution, planDistribution, leadFunnel, revenuePerMember };
  }),
});
