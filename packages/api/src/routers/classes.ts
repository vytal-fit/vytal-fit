import { TRPCError } from "@trpc/server";
import { and, asc, count, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { bookings, classes, classTypes, locations } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";

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

  create: orgProcedure.input(classInput).mutation(async ({ ctx, input }) => {
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
  cancel: orgProcedure
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
