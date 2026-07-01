import { and, count, eq, gte, inArray, isNotNull, lt, lte, or } from "drizzle-orm";
import {
  bookings,
  classTypes,
  classes,
  coaches,
  gymMembers,
  leads,
  memberContracts,
  messages,
  personalRecords,
  subscriptions,
  wods,
} from "@vytal-fit/db";
import { orgProcedure, router } from "../trpc";

/** Local YYYY-MM-DD for a date. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ENROLLED = ["confirmed", "checked_in"] as const;

/**
 * The "Today" owner briefing: one aggregation that answers "did I miss
 * anything, and what should I move on today?". Everything derives from real
 * org data — focus areas, actionable to-dos, today's class agenda, and
 * highlights. Modelled on Slack's Today daily briefing.
 */
export const todayRouter = router({
  briefing: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const now = new Date();
    const today = ymd(now);
    const tomorrow = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfNextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const in30 = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30));

    // Today's (non-cancelled) classes — the agenda.
    const todayClassRows = await ctx.db
      .select({
        id: classes.id,
        classTypeId: classes.classTypeId,
        coachIds: classes.coachIds,
        startTime: classes.startTime,
        endTime: classes.endTime,
        maxCapacity: classes.maxCapacity,
      })
      .from(classes)
      .where(and(eq(classes.organizationId, org), eq(classes.date, today)))
      .orderBy(classes.startTime);
    const liveClasses = todayClassRows.filter((c) => c.classTypeId != null);

    // Resolve class-type + coach labels and per-class enrolment.
    const typeIds = [...new Set(liveClasses.map((c) => c.classTypeId).filter(Boolean) as string[])];
    const coachIdSet = [...new Set(liveClasses.flatMap((c) => c.coachIds ?? []))];
    const classIds = liveClasses.map((c) => c.id);

    const [typeRows, coachRows, enrolRows] = await Promise.all([
      typeIds.length
        ? ctx.db
            .select({ id: classTypes.id, name: classTypes.name, color: classTypes.color, abbreviation: classTypes.abbreviation })
            .from(classTypes)
            .where(and(eq(classTypes.organizationId, org), inArray(classTypes.id, typeIds)))
        : Promise.resolve([] as { id: string; name: string; color: string | null; abbreviation: string | null }[]),
      coachIdSet.length
        ? ctx.db
            .select({ id: coaches.id, name: coaches.name })
            .from(coaches)
            .where(and(eq(coaches.organizationId, org), inArray(coaches.id, coachIdSet)))
        : Promise.resolve([] as { id: string; name: string }[]),
      classIds.length
        ? ctx.db
            .select({ classId: bookings.classId, status: bookings.status })
            .from(bookings)
            .where(
              and(
                eq(bookings.organizationId, org),
                inArray(bookings.classId, classIds),
                inArray(bookings.status, [...ENROLLED]),
              ),
            )
        : Promise.resolve([] as { classId: string; status: string }[]),
    ]);

    const typeById = new Map(typeRows.map((t) => [t.id, t]));
    const coachById = new Map(coachRows.map((c) => [c.id, c.name]));
    const enrolledByClass = new Map<string, number>();
    for (const b of enrolRows) enrolledByClass.set(b.classId, (enrolledByClass.get(b.classId) ?? 0) + 1);

    const agenda = liveClasses.map((c) => {
      const type = c.classTypeId ? typeById.get(c.classTypeId) : undefined;
      const coachNames = (c.coachIds ?? []).map((id) => coachById.get(id)).filter(Boolean) as string[];
      return {
        id: c.id,
        name: type?.name ?? "Aula",
        abbreviation: type?.abbreviation ?? "CF",
        color: type?.color ?? "#22c55e",
        startTime: c.startTime,
        endTime: c.endTime,
        maxCapacity: c.maxCapacity,
        enrolled: enrolledByClass.get(c.id) ?? 0,
        coachNames,
        hasCoach: coachNames.length > 0,
      };
    });
    const classesWithoutCoach = agenda.filter((c) => !c.hasCoach).length;

    // Signal counts (all real, org-scoped).
    const [
      [newLeads],
      [pendingPayments],
      [expiringContracts],
      [unreadMessages],
      [newMembersThisWeek],
      [prsToday],
      [tomorrowWod],
    ] = await Promise.all([
      ctx.db
        .select({ value: count() })
        .from(leads)
        .where(and(eq(leads.organizationId, org), eq(leads.stage, "lead"))),
      ctx.db
        .select({ value: count() })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.organizationId, org),
            or(eq(subscriptions.status, "expired"), lte(subscriptions.nextBillingDate, today)),
          ),
        ),
      ctx.db
        .select({ value: count() })
        .from(memberContracts)
        .where(
          and(
            eq(memberContracts.organizationId, org),
            isNotNull(memberContracts.expiryDate),
            lte(memberContracts.expiryDate, in30),
            gte(memberContracts.expiryDate, today),
          ),
        ),
      ctx.db
        .select({ value: count() })
        .from(messages)
        .where(and(eq(messages.organizationId, org), eq(messages.fromStaff, false), eq(messages.read, false))),
      ctx.db
        .select({ value: count() })
        .from(gymMembers)
        .where(and(eq(gymMembers.organizationId, org), gte(gymMembers.joinedAt, weekAgo))),
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
        .from(wods)
        .where(and(eq(wods.organizationId, org), eq(wods.date, tomorrow), isNotNull(wods.publishedAt))),
    ]);

    const pendingPaymentsN = pendingPayments?.value ?? 0;
    const expiringContractsN = expiringContracts?.value ?? 0;
    const newLeadsN = newLeads?.value ?? 0;
    const unreadMessagesN = unreadMessages?.value ?? 0;
    const newMembersN = newMembersThisWeek?.value ?? 0;
    const prsTodayN = prsToday?.value ?? 0;
    const tomorrowWodMissing = (tomorrowWod?.value ?? 0) === 0;

    // Focus areas — the prioritised "what to focus on today" list (highest first).
    const focus: { key: string; count: number; tone: "amber" | "red" | "blue" | "green"; href: string }[] = [];
    if (pendingPaymentsN > 0) focus.push({ key: "payments", count: pendingPaymentsN, tone: "red", href: "/payments" });
    if (classesWithoutCoach > 0) focus.push({ key: "coverage", count: classesWithoutCoach, tone: "amber", href: "/classes" });
    if (expiringContractsN > 0) focus.push({ key: "contracts", count: expiringContractsN, tone: "amber", href: "/members" });
    if (newLeadsN > 0) focus.push({ key: "leads", count: newLeadsN, tone: "blue", href: "/crm" });

    // Actionable to-dos (same signals, phrased as actions) + housekeeping.
    const todos: { id: string; key: string; count: number; href: string }[] = [];
    if (newLeadsN > 0) todos.push({ id: "leads", key: "leads", count: newLeadsN, href: "/crm" });
    if (pendingPaymentsN > 0) todos.push({ id: "payments", key: "payments", count: pendingPaymentsN, href: "/payments" });
    if (unreadMessagesN > 0) todos.push({ id: "messages", key: "messages", count: unreadMessagesN, href: "/messages" });
    if (expiringContractsN > 0) todos.push({ id: "contracts", key: "contracts", count: expiringContractsN, href: "/members" });
    if (classesWithoutCoach > 0) todos.push({ id: "coverage", key: "coverage", count: classesWithoutCoach, href: "/classes" });
    if (tomorrowWodMissing) todos.push({ id: "wod", key: "wod", count: 0, href: "/wods" });

    // Highlights — good-news / awareness items.
    const highlights: { id: string; key: string; count: number; href: string }[] = [];
    if (newMembersN > 0) highlights.push({ id: "new-members", key: "newMembers", count: newMembersN, href: "/members" });
    if (prsTodayN > 0) highlights.push({ id: "prs", key: "prs", count: prsTodayN, href: "/members" });
    if (newLeadsN > 0) highlights.push({ id: "leads", key: "leads", count: newLeadsN, href: "/crm" });

    return {
      date: today,
      agenda,
      focus,
      todos,
      highlights,
      counts: {
        classesToday: agenda.length,
        classesWithoutCoach,
        newLeads: newLeadsN,
        pendingPayments: pendingPaymentsN,
        expiringContracts: expiringContractsN,
        unreadMessages: unreadMessagesN,
        newMembersThisWeek: newMembersN,
        prsToday: prsTodayN,
        tomorrowWodMissing,
      },
    };
  }),
});
