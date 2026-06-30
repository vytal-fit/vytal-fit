import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { bookings, classes, classTypes, coaches, gymMembers, locations } from "@vytal-fit/db";
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

export const bookingsRouter = router({
  /**
   * Book a member into a class. Capacity-checked: when the class is full the
   * booking is created as `waitlisted` instead of `confirmed`. Duplicate
   * active bookings are rejected with CONFLICT.
   *
   * Athletes may book only their linked gym member row. Staff can book any
   * member in the active org.
   */
  book: orgProcedure
    .input(z.object({ classId: z.string().min(1), memberId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [klass] = await ctx.db
        .select({
          id: classes.id,
          maxCapacity: classes.maxCapacity,
          cancelledAt: classes.cancelledAt,
        })
        .from(classes)
        .where(
          and(
            eq(classes.id, input.classId),
            eq(classes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!klass) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
      }
      if (klass.cancelledAt) {
        throw new TRPCError({ code: "CONFLICT", message: "Class is cancelled." });
      }

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
        !ctx.session.role ||
        (!hasMinRole(ctx.session.role, "coach") && member.userId !== ctx.session.user.id)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Athletes can only book classes for their own member profile.",
        });
      }

      return ctx.db.transaction(async (tx) => {
        const [duplicate] = await tx
          .select({ id: bookings.id })
          .from(bookings)
          .where(
            and(
              eq(bookings.organizationId, ctx.activeOrganizationId),
              eq(bookings.classId, input.classId),
              eq(bookings.memberId, input.memberId),
              inArray(bookings.status, ["confirmed", "waitlisted", "checked_in"]),
            ),
          )
          .limit(1);
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Member already has an active booking for this class.",
          });
        }

        const [enrolled] = await tx
          .select({ value: count() })
          .from(bookings)
          .where(
            and(
              eq(bookings.organizationId, ctx.activeOrganizationId),
              eq(bookings.classId, input.classId),
              inArray(bookings.status, ["confirmed", "checked_in"]),
            ),
          );
        const isFull = (enrolled?.value ?? 0) >= klass.maxCapacity;

        const [created] = await tx
          .insert(bookings)
          .values({
            id: crypto.randomUUID(),
            organizationId: ctx.activeOrganizationId,
            classId: input.classId,
            memberId: input.memberId,
            status: isFull ? "waitlisted" : "confirmed",
          })
          .returning();
        return created;
      });
    }),

  cancel: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: bookings.id,
          memberId: bookings.memberId,
          status: bookings.status,
          memberUserId: gymMembers.userId,
        })
        .from(bookings)
        .innerJoin(gymMembers, eq(bookings.memberId, gymMembers.id))
        .where(
          and(
            eq(bookings.id, input.id),
            eq(bookings.organizationId, ctx.activeOrganizationId),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      }
      if (existing.status === "cancelled") {
        throw new TRPCError({ code: "CONFLICT", message: "Booking is already cancelled." });
      }
      if (
        !ctx.session.role ||
        (!hasMinRole(ctx.session.role, "coach") && existing.memberUserId !== ctx.session.user.id)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Athletes can only cancel bookings for their own member profile.",
        });
      }

      const [cancelled] = await ctx.db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(bookings.id, input.id),
            eq(bookings.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return cancelled;
    }),

  listByMember: orgProcedure
    .input(z.object({ memberId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
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

      const rows = await ctx.db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, ctx.activeOrganizationId),
            eq(bookings.memberId, input.memberId),
          ),
        )
        .orderBy(desc(bookings.bookedAt));

      const classIds = [...new Set(rows.map((row) => row.classId))];
      const classRows =
        classIds.length === 0
          ? []
          : await ctx.db
              .select({
                id: classes.id,
                classTypeId: classes.classTypeId,
                locationId: classes.locationId,
                coachIds: classes.coachIds,
                date: classes.date,
                startTime: classes.startTime,
                endTime: classes.endTime,
                maxCapacity: classes.maxCapacity,
                cancelledAt: classes.cancelledAt,
              })
              .from(classes)
              .where(
                and(
                  eq(classes.organizationId, ctx.activeOrganizationId),
                  inArray(classes.id, classIds),
                ),
              );
      const classTypeIds = [...new Set(classRows.map((row) => row.classTypeId))];
      const locationIds = [...new Set(classRows.map((row) => row.locationId))];
      const coachIds = [...new Set(classRows.flatMap((row) => row.coachIds ?? []))];

      const [typeRows, locationRows, coachRows, confirmedCounts, waitlistCounts] =
        await Promise.all([
          classTypeIds.length === 0
            ? Promise.resolve([])
            : ctx.db
                .select({
                  id: classTypes.id,
                  name: classTypes.name,
                  abbreviation: classTypes.abbreviation,
                  color: classTypes.color,
                })
                .from(classTypes)
                .where(
                  and(
                    eq(classTypes.organizationId, ctx.activeOrganizationId),
                    inArray(classTypes.id, classTypeIds),
                  ),
                ),
          locationIds.length === 0
            ? Promise.resolve([])
            : ctx.db
                .select({
                  id: locations.id,
                  name: locations.name,
                })
                .from(locations)
                .where(
                  and(
                    eq(locations.organizationId, ctx.activeOrganizationId),
                    inArray(locations.id, locationIds),
                  ),
                ),
          coachIds.length === 0
            ? Promise.resolve([])
            : ctx.db
                .select({
                  id: coaches.id,
                  name: coaches.name,
                })
                .from(coaches)
                .where(
                  and(
                    eq(coaches.organizationId, ctx.activeOrganizationId),
                    inArray(coaches.id, coachIds),
                  ),
                ),
          classIds.length === 0
            ? Promise.resolve([])
            : ctx.db
                .select({
                  classId: bookings.classId,
                  value: count(),
                })
                .from(bookings)
                .where(
                  and(
                    eq(bookings.organizationId, ctx.activeOrganizationId),
                    inArray(bookings.classId, classIds),
                    inArray(bookings.status, ["confirmed", "checked_in"]),
                  ),
                )
                .groupBy(bookings.classId),
          classIds.length === 0
            ? Promise.resolve([])
            : ctx.db
                .select({
                  classId: bookings.classId,
                  value: count(),
                })
                .from(bookings)
                .where(
                  and(
                    eq(bookings.organizationId, ctx.activeOrganizationId),
                    inArray(bookings.classId, classIds),
                    eq(bookings.status, "waitlisted"),
                  ),
                )
                .groupBy(bookings.classId),
        ]);

      const classTypeById = new Map(typeRows.map((row) => [row.id, row]));
      const locationById = new Map(locationRows.map((row) => [row.id, row]));
      const coachById = new Map(coachRows.map((row) => [row.id, row]));
      const confirmedByClassId = new Map(confirmedCounts.map((row) => [row.classId, row.value]));
      const waitlistByClassId = new Map(waitlistCounts.map((row) => [row.classId, row.value]));
      const classById = new Map(
        classRows.map((row) => [
          row.id,
          {
            ...row,
            classType: classTypeById.get(row.classTypeId) ?? null,
            location: locationById.get(row.locationId) ?? null,
            coaches: (row.coachIds ?? [])
              .map((coachId) => coachById.get(coachId))
              .filter((coach): coach is NonNullable<typeof coach> => Boolean(coach)),
            enrolledCount: confirmedByClassId.get(row.id) ?? 0,
            waitlistCount: waitlistByClassId.get(row.id) ?? 0,
          },
        ]),
      );

      return rows.map((row) => ({
        ...row,
        class: classById.get(row.classId) ?? null,
      }));
    }),

  /**
   * Roster for a class: every booking (any status) joined with the member's
   * name and number, newest first. Org-scoped — the class is re-fetched within
   * the active org and 404s if absent, so a caller can't read another org's
   * roster. Backs the attendance and waitlist views.
   */
  listByClass: orgProcedure
    .input(z.object({ classId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [klass] = await ctx.db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.id, input.classId),
            eq(classes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!klass) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
      }

      return ctx.db
        .select({
          id: bookings.id,
          memberId: bookings.memberId,
          classId: bookings.classId,
          status: bookings.status,
          bookedAt: bookings.bookedAt,
          checkedInAt: bookings.checkedInAt,
          memberName: gymMembers.name,
          memberNumber: gymMembers.memberNumber,
          memberEmail: gymMembers.email,
        })
        .from(bookings)
        .innerJoin(gymMembers, eq(bookings.memberId, gymMembers.id))
        .where(
          and(
            eq(bookings.organizationId, ctx.activeOrganizationId),
            eq(bookings.classId, input.classId),
          ),
        )
        .orderBy(desc(bookings.bookedAt));
    }),

  /**
   * Mark attendance for a single booking (staff+). `checked_in` stamps
   * `checkedInAt`; reverting to `confirmed` or marking `no_show` clears it.
   */
  setAttendance: staffProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(["confirmed", "checked_in", "no_show"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.id, input.id),
            eq(bookings.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      }

      const [updated] = await ctx.db
        .update(bookings)
        .set({
          status: input.status,
          checkedInAt: input.status === "checked_in" ? new Date() : null,
        })
        .where(
          and(
            eq(bookings.id, input.id),
            eq(bookings.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),
});
