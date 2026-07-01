import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { coachCertifications, coaches } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const certInput = z.object({
  coachId: z.string().min(1),
  name: z.string().min(1).max(160),
  issuedDate: DATE,
  expiryDate: DATE.optional(),
  documentUrl: z.string().url().optional(),
});

export const certificationsRouter = router({
  /**
   * Org coach certifications, joined with coach name, newest first. Status is
   * NOT stored: callers derive valid/expiring/expired from `expiryDate`.
   */
  list: orgProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: coachCertifications.id,
        coachId: coachCertifications.coachId,
        coachName: coaches.name,
        name: coachCertifications.name,
        issuedDate: coachCertifications.issuedDate,
        expiryDate: coachCertifications.expiryDate,
        documentUrl: coachCertifications.documentUrl,
      })
      .from(coachCertifications)
      .innerJoin(coaches, eq(coaches.id, coachCertifications.coachId))
      .where(eq(coachCertifications.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(coachCertifications.issuedDate));
    return rows;
  }),

  create: staffProcedure.input(certInput).mutation(async ({ ctx, input }) => {
    // The coach must belong to the caller's org (no cross-tenant attachment).
    const [coach] = await ctx.db
      .select({ id: coaches.id })
      .from(coaches)
      .where(and(eq(coaches.id, input.coachId), eq(coaches.organizationId, ctx.activeOrganizationId)))
      .limit(1);
    if (!coach) throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });

    const [created] = await ctx.db
      .insert(coachCertifications)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        coachId: input.coachId,
        name: input.name,
        issuedDate: input.issuedDate,
        expiryDate: input.expiryDate ?? null,
        documentUrl: input.documentUrl ?? null,
      })
      .returning();
    return created;
  }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(coachCertifications)
        .where(
          and(
            eq(coachCertifications.id, input.id),
            eq(coachCertifications.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Certification not found." });
      return { id: deleted.id };
    }),
});
