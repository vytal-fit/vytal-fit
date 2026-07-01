import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { classTemplates } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const templateInput = z.object({
  name: z.string().min(1).max(160),
  classType: z.string().min(1).max(80),
  time: z.string().min(1).max(20),
  duration: z.string().min(1).max(40),
  coach: z.string().min(1).max(120),
  capacity: z.number().int().min(1).max(999),
  location: z.string().min(1).max(120),
  days: z.string().min(1).max(60),
});

export const classTemplatesRouter = router({
  /** Org class schedule templates, newest first. */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(classTemplates)
      .where(eq(classTemplates.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(classTemplates.createdAt));
  }),

  create: staffProcedure.input(templateInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(classTemplates)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  update: staffProcedure
    .input(templateInput.partial().extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      const [updated] = await ctx.db
        .update(classTemplates)
        .set(patch)
        .where(
          and(
            eq(classTemplates.id, id),
            eq(classTemplates.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(classTemplates)
        .where(
          and(
            eq(classTemplates.id, input.id),
            eq(classTemplates.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });
      return { id: deleted.id };
    }),
});
