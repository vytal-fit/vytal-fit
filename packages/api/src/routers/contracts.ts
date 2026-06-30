import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import {
  contractTemplates,
  gymMembers,
  memberContracts,
  CONTRACT_STATUSES,
} from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

export const contractsRouter = router({
  /** Member contracts/waivers, joined with the member's name. */
  list: orgProcedure
    .input(z.object({ status: z.enum(CONTRACT_STATUSES).optional() }).default({}))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: memberContracts.id,
          memberId: memberContracts.memberId,
          memberName: gymMembers.name,
          contractType: memberContracts.contractType,
          status: memberContracts.status,
          signedDate: memberContracts.signedDate,
          expiryDate: memberContracts.expiryDate,
        })
        .from(memberContracts)
        .innerJoin(gymMembers, eq(memberContracts.memberId, gymMembers.id))
        .where(
          and(
            eq(memberContracts.organizationId, ctx.activeOrganizationId),
            input.status ? eq(memberContracts.status, input.status) : undefined,
          ),
        )
        .orderBy(desc(memberContracts.createdAt));
    }),

  /** Reusable contract templates for the org. */
  templates: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(contractTemplates)
      .where(eq(contractTemplates.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(contractTemplates.updatedAt));
  }),

  /** Assign a contract to a member (staff+). */
  create: staffProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        contractType: z.string().min(1).max(200),
        status: z.enum(CONTRACT_STATUSES).default("pending"),
        signedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
      const [created] = await ctx.db
        .insert(memberContracts)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          memberId: input.memberId,
          contractType: input.contractType,
          status: input.status,
          signedDate: input.signedDate ?? null,
          expiryDate: input.expiryDate ?? null,
        })
        .returning();
      return created;
    }),

  /** Mark a contract as signed (stamps today's date). */
  sign: staffProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().slice(0, 10);
      const [updated] = await ctx.db
        .update(memberContracts)
        .set({ status: "signed", signedDate: today })
        .where(
          and(
            eq(memberContracts.id, input.id),
            eq(memberContracts.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found." });
      }
      return updated;
    }),

  /** Edit a contract template (admin+); bumps updatedAt. */
  updateTemplate: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(200),
        required: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(contractTemplates)
        .set({ name: input.name, required: input.required, updatedAt: new Date() })
        .where(
          and(
            eq(contractTemplates.id, input.id),
            eq(contractTemplates.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });
      }
      return updated;
    }),

  /** Add a contract template (admin+). */
  createTemplate: adminProcedure
    .input(z.object({ name: z.string().min(1).max(200), required: z.boolean().default(true) }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(contractTemplates)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          name: input.name,
          required: input.required,
        })
        .returning();
      return created;
    }),
});
