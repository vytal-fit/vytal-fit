import { TRPCError } from "@trpc/server";
import { and, asc, count, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { bookings, classes, classTypes, coaches, locations } from "@vytal-fit/db";
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
});
