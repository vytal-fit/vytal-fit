import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray, lt } from "drizzle-orm";
import { bookings, classes, classTypes, coaches, COACH_ROLES } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const coachInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  photo: z.string().url().optional(),
  role: z.enum(COACH_ROLES).default("coach"),
});

export const coachesRouter = router({
  /** Full coach roster for the active org (small reference data, no pagination). */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(coaches)
      .where(eq(coaches.organizationId, ctx.activeOrganizationId))
      .orderBy(asc(coaches.name));
  }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(coaches)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
      return row;
    }),

  /**
   * Coach performance, derived entirely from real classes + attendance (no
   * stored metrics): classes this month, average attendance, attendance rate,
   * a 12-week attendance trend, per-class-type breakdown, and best/worst type.
   */
  performance: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const [coach] = await ctx.db
        .select({ id: coaches.id })
        .from(coaches)
        .where(and(eq(coaches.id, input.id), eq(coaches.organizationId, org)))
        .limit(1);
      if (!coach) throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });

      const today = new Date().toISOString().slice(0, 10);
      const monthPrefix = today.slice(0, 7);

      const orgClasses = await ctx.db
        .select()
        .from(classes)
        .where(eq(classes.organizationId, org));
      const coachClasses = orgClasses.filter((c) => c.coachIds.includes(input.id));

      const empty = {
        classesThisMonth: 0,
        avgAttendance: 0,
        attendanceRate: 0,
        attendanceTrend: [] as { week: string; avg: number }[],
        classBreakdown: [] as { type: string; attendance: number }[],
        bestClass: null as { type: string; avg: number } | null,
        worstClass: null as { type: string; avg: number } | null,
      };
      if (coachClasses.length === 0) return empty;

      const classIds = coachClasses.map((c) => c.id);
      const [bks, cts] = await Promise.all([
        ctx.db
          .select({ classId: bookings.classId, status: bookings.status })
          .from(bookings)
          .where(and(eq(bookings.organizationId, org), inArray(bookings.classId, classIds))),
        ctx.db
          .select({ id: classTypes.id, name: classTypes.name })
          .from(classTypes)
          .where(eq(classTypes.organizationId, org)),
      ]);
      const ctName = new Map(cts.map((c) => [c.id, c.name]));

      const attendedByClass = new Map<string, number>();
      for (const b of bks) {
        if (b.status === "checked_in") {
          attendedByClass.set(b.classId, (attendedByClass.get(b.classId) ?? 0) + 1);
        }
      }

      const past = coachClasses.filter((c) => c.date < today);
      const classesThisMonth = coachClasses.filter((c) => c.date.startsWith(monthPrefix)).length;

      const totalAttended = past.reduce((s, c) => s + (attendedByClass.get(c.id) ?? 0), 0);
      const totalCapacity = past.reduce((s, c) => s + (c.maxCapacity ?? 0), 0);
      const avgAttendance = past.length ? +(totalAttended / past.length).toFixed(1) : 0;
      const attendanceRate = totalCapacity ? Math.round((totalAttended / totalCapacity) * 100) : 0;

      // 12-week attendance trend (bucketed by the Monday of each class's week).
      const mondayOf = (dateStr: string) => {
        const d = new Date(`${dateStr}T00:00:00Z`);
        const dow = (d.getUTCDay() + 6) % 7;
        d.setUTCDate(d.getUTCDate() - dow);
        return d.toISOString().slice(0, 10);
      };
      const weekAgg = new Map<string, { sum: number; n: number }>();
      for (const c of past) {
        const k = mondayOf(c.date);
        const w = weekAgg.get(k) ?? { sum: 0, n: 0 };
        w.sum += attendedByClass.get(c.id) ?? 0;
        w.n += 1;
        weekAgg.set(k, w);
      }
      const attendanceTrend = [...weekAgg.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([k, v]) => ({ week: k.slice(5), avg: +(v.sum / v.n).toFixed(1) }));

      // Per-class-type average attendance.
      const typeAgg = new Map<string, { sum: number; n: number }>();
      for (const c of past) {
        const name = (c.classTypeId ? ctName.get(c.classTypeId) : undefined) ?? "-";
        const a = typeAgg.get(name) ?? { sum: 0, n: 0 };
        a.sum += attendedByClass.get(c.id) ?? 0;
        a.n += 1;
        typeAgg.set(name, a);
      }
      const classBreakdown = [...typeAgg.entries()]
        .map(([type, v]) => ({ type, attendance: +(v.sum / v.n).toFixed(1) }))
        .sort((a, b) => b.attendance - a.attendance);

      return {
        classesThisMonth,
        avgAttendance,
        attendanceRate,
        attendanceTrend,
        classBreakdown,
        bestClass: classBreakdown[0] ? { type: classBreakdown[0].type, avg: classBreakdown[0].attendance } : null,
        worstClass:
          classBreakdown.length > 1
            ? { type: classBreakdown[classBreakdown.length - 1].type, avg: classBreakdown[classBreakdown.length - 1].attendance }
            : null,
      };
    }),

  create: adminProcedure.input(coachInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(coaches)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  update: adminProcedure
    // Strip defaults before .partial() — zod applies .default() even for
    // omitted keys in a partial, silently resetting role to "coach".
    .input(
      z.object({
        id: z.string().min(1),
        data: coachInput.extend({ role: z.enum(COACH_ROLES) }).partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: coaches.id })
        .from(coaches)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }

      const [updated] = await ctx.db
        .update(coaches)
        .set(input.data)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  /**
   * Hard delete — the coaches table carries no status/active column.
   * `leads.assignedCoachId` is `set null` on delete, so removal is safe.
   */
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(coaches)
        .where(
          and(
            eq(coaches.id, input.id),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
      return deleted;
    }),
});
