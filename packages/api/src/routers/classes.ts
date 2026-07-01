import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, gte, inArray, isNull, lt, lte } from "drizzle-orm";
import { bookings, classes, classFeedback, classTypes, coaches, gymMembers, locations } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM");

const classInput = z.object({
  classTypeId: z.string().min(1),
  locationId: z.string().min(1),
  coachIds: z.array(z.string().min(1)).default([]),
  date: dateString,
  startTime: timeString,
  endTime: timeString,
  maxCapacity: z.number().int().min(1).max(1000),
});

export const classesRouter = router({
  /** Classes within a date range (inclusive), org-scoped. */
  list: orgProcedure
    .input(z.object({ from: dateString, to: dateString }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(classes)
        .where(
          and(
            eq(classes.organizationId, ctx.activeOrganizationId),
            gte(classes.date, input.from),
            lte(classes.date, input.to),
          ),
        )
        .orderBy(asc(classes.date), asc(classes.startTime));
    }),

  /**
   * Classes within a date range, enriched with class type, location, coaches
   * and the enrolled count (confirmed + checked-in). For schedule views.
   */
  schedule: orgProcedure
    .input(z.object({ from: dateString, to: dateString }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(classes)
        .where(
          and(
            eq(classes.organizationId, ctx.activeOrganizationId),
            gte(classes.date, input.from),
            lte(classes.date, input.to),
          ),
        )
        .orderBy(asc(classes.date), asc(classes.startTime));

      if (rows.length === 0) return [];

      const classTypeIds = [...new Set(rows.map((r) => r.classTypeId).filter((x): x is string => !!x))];
      const locationIds = [...new Set(rows.map((r) => r.locationId).filter((x): x is string => !!x))];
      const coachIds = [...new Set(rows.flatMap((r) => r.coachIds))];
      const classIds = rows.map((r) => r.id);

      const [cts, locs, cos, bks] = await Promise.all([
        classTypeIds.length
          ? ctx.db.select().from(classTypes).where(and(eq(classTypes.organizationId, ctx.activeOrganizationId), inArray(classTypes.id, classTypeIds)))
          : Promise.resolve([]),
        locationIds.length
          ? ctx.db.select().from(locations).where(and(eq(locations.organizationId, ctx.activeOrganizationId), inArray(locations.id, locationIds)))
          : Promise.resolve([]),
        coachIds.length
          ? ctx.db.select().from(coaches).where(and(eq(coaches.organizationId, ctx.activeOrganizationId), inArray(coaches.id, coachIds)))
          : Promise.resolve([]),
        ctx.db
          .select({ classId: bookings.classId, status: bookings.status })
          .from(bookings)
          .where(and(eq(bookings.organizationId, ctx.activeOrganizationId), inArray(bookings.classId, classIds))),
      ]);

      const ctMap = new Map(cts.map((c) => [c.id, c] as const));
      const locMap = new Map(locs.map((l) => [l.id, l] as const));
      const coMap = new Map(cos.map((c) => [c.id, c] as const));
      const enrolledByClass = new Map<string, number>();
      const waitlistByClass = new Map<string, number>();
      for (const b of bks) {
        if (b.status === "confirmed" || b.status === "checked_in") {
          enrolledByClass.set(b.classId, (enrolledByClass.get(b.classId) ?? 0) + 1);
        } else if (b.status === "waitlisted") {
          waitlistByClass.set(b.classId, (waitlistByClass.get(b.classId) ?? 0) + 1);
        }
      }

      return rows.map((r) => ({
        ...r,
        classType: r.classTypeId ? ctMap.get(r.classTypeId) ?? null : null,
        location: r.locationId ? locMap.get(r.locationId) ?? null : null,
        coaches: r.coachIds.map((id) => coMap.get(id)).filter((c): c is NonNullable<typeof c> => !!c),
        enrolledCount: enrolledByClass.get(r.id) ?? 0,
        waitlistCount: waitlistByClass.get(r.id) ?? 0,
      }));
    }),

  /** Single class with its active bookings count. */
  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(classes)
        .where(
          and(
            eq(classes.id, input.id),
            eq(classes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
      }

      const [enrolled] = await ctx.db
        .select({ value: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, ctx.activeOrganizationId),
            eq(bookings.classId, row.id),
            inArray(bookings.status, ["confirmed", "checked_in"]),
          ),
        );
      const [waitlisted] = await ctx.db
        .select({ value: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, ctx.activeOrganizationId),
            eq(bookings.classId, row.id),
            eq(bookings.status, "waitlisted"),
          ),
        );

      return {
        ...row,
        enrolledCount: enrolled?.value ?? 0,
        waitlistCount: waitlisted?.value ?? 0,
      };
    }),

  create: staffProcedure.input(classInput).mutation(async ({ ctx, input }) => {
    // Referenced rows must belong to the active org (NOT_FOUND, never leak).
    const [classType] = await ctx.db
      .select({ id: classTypes.id })
      .from(classTypes)
      .where(
        and(
          eq(classTypes.id, input.classTypeId),
          eq(classTypes.organizationId, ctx.activeOrganizationId),
        ),
      )
      .limit(1);
    if (!classType) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
    }

    const [location] = await ctx.db
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.id, input.locationId),
          eq(locations.organizationId, ctx.activeOrganizationId),
        ),
      )
      .limit(1);
    if (!location) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Location not found." });
    }

    const [created] = await ctx.db
      .insert(classes)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  /** Cancel a class: mark it cancelled and cancel its active bookings. */
  cancel: staffProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: classes.id, cancelledAt: classes.cancelledAt })
        .from(classes)
        .where(
          and(
            eq(classes.id, input.id),
            eq(classes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
      }
      if (existing.cancelledAt) {
        throw new TRPCError({ code: "CONFLICT", message: "Class is already cancelled." });
      }

      const cancelled = await ctx.db.transaction(async (tx) => {
        await tx
          .update(bookings)
          .set({ status: "cancelled" })
          .where(
            and(
              eq(bookings.organizationId, ctx.activeOrganizationId),
              eq(bookings.classId, input.id),
              inArray(bookings.status, ["confirmed", "waitlisted"]),
            ),
          );
        const [row] = await tx
          .update(classes)
          .set({ cancelledAt: new Date() })
          .where(
            and(
              eq(classes.id, input.id),
              eq(classes.organizationId, ctx.activeOrganizationId),
              isNull(classes.cancelledAt),
            ),
          )
          .returning();
        return row;
      });

      if (!cancelled) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
      }
      return cancelled;
    }),

  /**
   * Past-class history with attendance, derived from real classes + bookings:
   * per-class enrolled/attended/no-shows + attendee names, plus weekly
   * attendance trend and average-attendance-by-type.
   */
  history: orgProcedure
    .input(z.object({ limit: z.number().int().min(1).max(500).default(120) }).default({ limit: 120 }))
    .query(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const today = new Date().toISOString().slice(0, 10);

      const past = await ctx.db
        .select()
        .from(classes)
        .where(and(eq(classes.organizationId, org), lt(classes.date, today)))
        .orderBy(desc(classes.date), desc(classes.startTime))
        .limit(input.limit);

      if (past.length === 0) {
        return { entries: [], attendanceTrend: [], attendanceByType: [], noShowsByType: [] };
      }

      const classIds = past.map((c) => c.id);
      const [bks, cts, cos, locs] = await Promise.all([
        ctx.db
          .select({ classId: bookings.classId, status: bookings.status, memberName: gymMembers.name })
          .from(bookings)
          .innerJoin(gymMembers, eq(bookings.memberId, gymMembers.id))
          .where(and(eq(bookings.organizationId, org), inArray(bookings.classId, classIds))),
        ctx.db.select({ id: classTypes.id, name: classTypes.name, color: classTypes.color }).from(classTypes).where(eq(classTypes.organizationId, org)),
        ctx.db.select({ id: coaches.id, name: coaches.name }).from(coaches).where(eq(coaches.organizationId, org)),
        ctx.db.select({ id: locations.id, name: locations.name }).from(locations).where(eq(locations.organizationId, org)),
      ]);

      const ctMap = new Map(cts.map((c) => [c.id, c]));
      const coMap = new Map(cos.map((c) => [c.id, c.name]));
      const locMap = new Map(locs.map((l) => [l.id, l.name]));
      const byClass = new Map<string, { enrolled: number; attended: number; noShows: number; attendees: string[] }>();
      for (const b of bks) {
        const e = byClass.get(b.classId) ?? { enrolled: 0, attended: 0, noShows: 0, attendees: [] };
        if (b.status === "cancelled" || b.status === "waitlisted") {
          // ignore for attendance
        } else {
          e.enrolled += 1;
          if (b.status === "checked_in") {
            e.attended += 1;
            e.attendees.push(b.memberName);
          }
          if (b.status === "no_show") e.noShows += 1;
        }
        byClass.set(b.classId, e);
      }

      const entries = past.map((c) => {
        const ct = c.classTypeId ? ctMap.get(c.classTypeId) : undefined;
        const agg = byClass.get(c.id) ?? { enrolled: 0, attended: 0, noShows: 0, attendees: [] };
        return {
          id: c.id,
          date: c.date,
          time: c.startTime,
          classType: ct?.name ?? "-",
          classTypeColor: ct?.color ?? "#6b8c72",
          coach: c.coachIds.map((id) => coMap.get(id)).filter(Boolean).join(", ") || "-",
          location: c.locationId ? locMap.get(c.locationId) ?? "-" : "-",
          enrolled: agg.enrolled,
          attended: agg.attended,
          noShows: agg.noShows,
          capacity: c.maxCapacity,
          attendees: agg.attendees,
        };
      });

      // Weekly attendance trend (last ~12 ISO weeks present in data).
      const weekAvg = new Map<string, { sum: number; n: number }>();
      for (const e of entries) {
        const d = new Date(e.date);
        const onejan = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        const key = `${d.getFullYear()}-W${week}`;
        const w = weekAvg.get(key) ?? { sum: 0, n: 0 };
        w.sum += e.attended;
        w.n += 1;
        weekAvg.set(key, w);
      }
      const attendanceTrend = [...weekAvg.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([key, w], i) => ({ week: `W${i + 1}`, label: key, avg: Math.round((w.sum / w.n) * 10) / 10 }));

      // Average attendance + no-shows by class type.
      const typeAgg = new Map<string, { sum: number; n: number; noShows: number }>();
      for (const e of entries) {
        const t = typeAgg.get(e.classType) ?? { sum: 0, n: 0, noShows: 0 };
        t.sum += e.attended;
        t.n += 1;
        t.noShows += e.noShows;
        typeAgg.set(e.classType, t);
      }
      const attendanceByType = [...typeAgg.entries()].map(([type, t]) => ({
        type,
        avg: Math.round((t.sum / t.n) * 10) / 10,
      }));
      const noShowsByType = [...typeAgg.entries()]
        .map(([type, t]) => ({ name: type, value: t.noShows }))
        .filter((x) => x.value > 0);

      return { entries, attendanceTrend, attendanceByType, noShowsByType };
    }),

  /** Feedback for one class: entries + average + 1-5 distribution + response rate. */
  feedback: orgProcedure
    .input(z.object({ classId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const rows = await ctx.db
        .select()
        .from(classFeedback)
        .where(and(eq(classFeedback.organizationId, org), eq(classFeedback.classId, input.classId)))
        .orderBy(desc(classFeedback.createdAt));
      const total = rows.length;
      const average = total ? +(rows.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
      const distribution = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: rows.filter((r) => r.rating === stars).length,
      }));
      // Response rate = feedback / bookings on the class.
      const [enrolled] = await ctx.db
        .select({ n: count() })
        .from(bookings)
        .where(and(eq(bookings.organizationId, org), eq(bookings.classId, input.classId)));
      const enrolledN = enrolled?.n ?? 0;
      const responseRate = enrolledN ? Math.round((total / enrolledN) * 100) : 0;
      return {
        items: rows.map((r) => ({ id: r.id, memberName: r.memberName, rating: r.rating, comment: r.comment ?? "", createdAt: r.createdAt })),
        average,
        count: total,
        distribution,
        responseRate,
      };
    }),

  submitFeedback: orgProcedure
    .input(
      z.object({
        classId: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(classFeedback)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          classId: input.classId,
          memberName: ctx.session?.user.name ?? "Member",
          rating: input.rating,
          comment: input.comment ?? null,
        })
        .returning();
      return created;
    }),
});
