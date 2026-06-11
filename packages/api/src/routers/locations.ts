import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { classes, locations } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";

const locationInput = z.object({
  name: z.string().min(1).max(200),
  capacity: z.number().int().min(1).max(10000).optional(),
});

export const locationsRouter = router({
  /** Full location list for the active org (small reference data, no pagination). */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(locations)
      .where(eq(locations.organizationId, ctx.activeOrganizationId))
      .orderBy(asc(locations.name));
  }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(locations)
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Location not found." });
      }
      return row;
    }),

  create: orgProcedure.input(locationInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(locations)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  update: orgProcedure
    .input(z.object({ id: z.string().min(1), data: locationInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: locations.id })
        .from(locations)
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Location not found." });
      }

      const [updated] = await ctx.db
        .update(locations)
        .set(input.data)
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  /**
   * Hard delete. `classes.locationId` is FK `restrict`, so a location that is
   * still referenced by a class is rejected with CONFLICT instead of leaking
   * a raw FK violation.
   */
  delete: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: locations.id })
        .from(locations)
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Location not found." });
      }

      const [inUse] = await ctx.db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.organizationId, ctx.activeOrganizationId),
            eq(classes.locationId, input.id),
          ),
        )
        .limit(1);
      if (inUse) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Location is in use by one or more classes.",
        });
      }

      const [deleted] = await ctx.db
        .delete(locations)
        .where(
          and(
            eq(locations.id, input.id),
            eq(locations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Location not found." });
      }
      return deleted;
    }),
});
