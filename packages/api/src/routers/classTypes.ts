import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { classTypes, classes, wods } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const classTypeInput = z.object({
  name: z.string().min(1).max(200),
  abbreviation: z.string().min(1).max(20),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected #RRGGBB"),
  icon: z.string().max(100).optional(),
  active: z.boolean().default(true),
});

export const classTypesRouter = router({
  /** Full class-type list for the active org (small reference data, no pagination). */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(classTypes)
      .where(eq(classTypes.organizationId, ctx.activeOrganizationId))
      .orderBy(asc(classTypes.name));
  }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(classTypes)
        .where(
          and(
            eq(classTypes.id, input.id),
            eq(classTypes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
      }
      return row;
    }),

  create: adminProcedure.input(classTypeInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(classTypes)
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
    // omitted keys in a partial, silently re-activating the class type.
    .input(
      z.object({
        id: z.string().min(1),
        data: classTypeInput.extend({ active: z.boolean() }).partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: classTypes.id })
        .from(classTypes)
        .where(
          and(
            eq(classTypes.id, input.id),
            eq(classTypes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
      }

      const [updated] = await ctx.db
        .update(classTypes)
        .set(input.data)
        .where(
          and(
            eq(classTypes.id, input.id),
            eq(classTypes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  /**
   * Hard delete. `classes.classTypeId` and `wods.classTypeId` are FK
   * `restrict`, so a class type still referenced is rejected with CONFLICT
   * instead of leaking a raw FK violation. (To retire a class type that has
   * history, set `active: false` via `update` instead.)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: classTypes.id })
        .from(classTypes)
        .where(
          and(
            eq(classTypes.id, input.id),
            eq(classTypes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
      }

      const [classInUse] = await ctx.db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.organizationId, ctx.activeOrganizationId),
            eq(classes.classTypeId, input.id),
          ),
        )
        .limit(1);
      const [wodInUse] = classInUse
        ? [classInUse]
        : await ctx.db
            .select({ id: wods.id })
            .from(wods)
            .where(
              and(
                eq(wods.organizationId, ctx.activeOrganizationId),
                eq(wods.classTypeId, input.id),
              ),
            )
            .limit(1);
      if (classInUse || wodInUse) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Class type is in use by classes or WODs.",
        });
      }

      const [deleted] = await ctx.db
        .delete(classTypes)
        .where(
          and(
            eq(classTypes.id, input.id),
            eq(classTypes.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
      }
      return deleted;
    }),
});
