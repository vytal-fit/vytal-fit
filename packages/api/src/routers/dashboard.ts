import { and, count, eq, gte, lt } from "drizzle-orm";
import { bookings, classes, gymMembers } from "@vytal-fit/db";
import { orgProcedure, router } from "../trpc";

/** Local YYYY-MM-DD for "today" boundaries. */
function todayString(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const dashboardRouter = router({
  stats: orgProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const today = todayString(now);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfNextDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    const [activeMembers] = await ctx.db
      .select({ value: count() })
      .from(gymMembers)
      .where(
        and(
          eq(gymMembers.organizationId, ctx.activeOrganizationId),
          eq(gymMembers.status, "active"),
        ),
      );

    const [classesToday] = await ctx.db
      .select({ value: count() })
      .from(classes)
      .where(
        and(
          eq(classes.organizationId, ctx.activeOrganizationId),
          eq(classes.date, today),
        ),
      );

    const [bookingsToday] = await ctx.db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.organizationId, ctx.activeOrganizationId),
          gte(bookings.bookedAt, startOfDay),
          lt(bookings.bookedAt, startOfNextDay),
        ),
      );

    return {
      activeMembers: activeMembers?.value ?? 0,
      classesToday: classesToday?.value ?? 0,
      bookingsToday: bookingsToday?.value ?? 0,
    };
  }),
});
