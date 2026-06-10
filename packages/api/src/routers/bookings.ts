import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { bookings, classes, gymMembers } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";

export const bookingsRouter = router({
  /**
   * Book a member into a class. Capacity-checked: when the class is full the
   * booking is created as `waitlisted` instead of `confirmed`. Duplicate
   * active bookings are rejected with CONFLICT.
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
        .select({ id: bookings.id, status: bookings.status })
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
      if (existing.status === "cancelled") {
        throw new TRPCError({ code: "CONFLICT", message: "Booking is already cancelled." });
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

      return ctx.db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.organizationId, ctx.activeOrganizationId),
            eq(bookings.memberId, input.memberId),
          ),
        )
        .orderBy(desc(bookings.bookedAt));
    }),
});
