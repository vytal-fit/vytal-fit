import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import {
  coaches,
  leadActivities,
  leads,
  LEAD_ACTIVITY_TYPES,
  LEAD_STAGES,
} from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const leadInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  stage: z.enum(LEAD_STAGES).default("lead"),
  source: z.string().max(100).optional(),
  assignedCoachId: z.string().min(1).optional(),
  notes: z.string().max(2000).optional(),
});

// Editable lead fields — stage is owned by `updateStage`. No `.default()` here
// (zod v4 applies defaults inside `.partial()`, which would reset columns).
const leadUpdateInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  source: z.string().max(100).nullable().optional(),
  assignedCoachId: z.string().min(1).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  trialDate: z.coerce.date().nullable().optional(),
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

  /** Single lead with its resolved coach and full activity timeline. */
  get: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [lead] = await ctx.db
        .select()
        .from(leads)
        .where(
          and(eq(leads.id, input.id), eq(leads.organizationId, ctx.activeOrganizationId)),
        )
        .limit(1);
      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
      }

      const coach = lead.assignedCoachId
        ? (
            await ctx.db
              .select({ id: coaches.id, name: coaches.name })
              .from(coaches)
              .where(
                and(
                  eq(coaches.id, lead.assignedCoachId),
                  eq(coaches.organizationId, ctx.activeOrganizationId),
                ),
              )
              .limit(1)
          )[0] ?? null
        : null;

      const activities = await ctx.db
        .select()
        .from(leadActivities)
        .where(
          and(
            eq(leadActivities.leadId, lead.id),
            eq(leadActivities.organizationId, ctx.activeOrganizationId),
          ),
        )
        .orderBy(desc(leadActivities.createdAt));

      return { ...lead, coach, activities };
    }),

  create: staffProcedure.input(leadInput).mutation(async ({ ctx, input }) => {
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

  updateStage: staffProcedure
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

      await ctx.db.insert(leadActivities).values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        leadId: updated.id,
        type: "stage_change",
        title: "Estado alterado",
        details: `Lead movida para "${input.stage}".`,
      });

      return updated;
    }),

  /** Edit a lead's profile fields (stage is owned by `updateStage`). */
  update: staffProcedure.input(leadUpdateInput).mutation(async ({ ctx, input }) => {
    const { id, ...patch } = input;

    if (patch.assignedCoachId) {
      const [coach] = await ctx.db
        .select({ id: coaches.id })
        .from(coaches)
        .where(
          and(
            eq(coaches.id, patch.assignedCoachId),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!coach) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
    }

    const [updated] = await ctx.db
      .update(leads)
      .set(patch)
      .where(
        and(eq(leads.id, id), eq(leads.organizationId, ctx.activeOrganizationId)),
      )
      .returning();
    if (!updated) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
    }
    return updated;
  }),

  /** Append a manual timeline entry (note, call, email, booking, …). */
  logActivity: staffProcedure
    .input(
      z.object({
        leadId: z.string().min(1),
        type: z.enum(LEAD_ACTIVITY_TYPES),
        title: z.string().min(1).max(200),
        details: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Re-fetch the lead scoped to the org before writing — never trust ids.
      const [lead] = await ctx.db
        .select({ id: leads.id })
        .from(leads)
        .where(
          and(
            eq(leads.id, input.leadId),
            eq(leads.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
      }

      const [created] = await ctx.db
        .insert(leadActivities)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          leadId: input.leadId,
          type: input.type,
          title: input.title,
          details: input.details ?? null,
        })
        .returning();

      await ctx.db
        .update(leads)
        .set({ lastContactAt: new Date() })
        .where(
          and(eq(leads.id, input.leadId), eq(leads.organizationId, ctx.activeOrganizationId)),
        );

      return created;
    }),

  /** Hard delete of a CRM lead. No domain rows reference leads. */
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: leads.id })
        .from(leads)
        .where(
          and(eq(leads.id, input.id), eq(leads.organizationId, ctx.activeOrganizationId)),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
      }

      const [deleted] = await ctx.db
        .delete(leads)
        .where(
          and(eq(leads.id, input.id), eq(leads.organizationId, ctx.activeOrganizationId)),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
      }
      return deleted;
    }),
});
