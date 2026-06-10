import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { coaches, leads, LEAD_STAGES } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";

const leadInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  stage: z.enum(LEAD_STAGES).default("lead"),
  source: z.string().max(100).optional(),
  assignedCoachId: z.string().min(1).optional(),
  notes: z.string().max(2000).optional(),
});

export const leadsRouter = router({
  list: orgProcedure
    .input(z.object({ stage: z.enum(LEAD_STAGES).optional() }).default({}))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(leads)
        .where(
          and(
            eq(leads.organizationId, ctx.activeOrganizationId),
            input.stage ? eq(leads.stage, input.stage) : undefined,
          ),
        )
        .orderBy(desc(leads.createdAt));
    }),

  create: orgProcedure.input(leadInput).mutation(async ({ ctx, input }) => {
    if (input.assignedCoachId) {
      const [coach] = await ctx.db
        .select({ id: coaches.id })
        .from(coaches)
        .where(
          and(
            eq(coaches.id, input.assignedCoachId),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!coach) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
    }

    const [created] = await ctx.db
      .insert(leads)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),

  updateStage: orgProcedure
    .input(z.object({ id: z.string().min(1), stage: z.enum(LEAD_STAGES) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(leads)
        .set({ stage: input.stage, lastContactAt: new Date() })
        .where(
          and(eq(leads.id, input.id), eq(leads.organizationId, ctx.activeOrganizationId)),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
      }
      return updated;
    }),
});
