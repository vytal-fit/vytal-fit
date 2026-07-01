import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  automationEnrollments,
  automationSequences,
  automationSteps,
  gymMembers,
  organization,
} from "@vytal-fit/db";
import { applyMarketingEmailPolicy } from "@vytal-fit/comms";
import { sendEmail } from "@vytal-fit/email";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const TRIGGERS = ["new_member", "inactive", "trial", "manual"] as const;

function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "https://api.vytal.fit";
}

export const automationsRouter = router({
  /** Sequences with their ordered steps + enrollment/sent stats. */
  list: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const seqs = await ctx.db
      .select()
      .from(automationSequences)
      .where(eq(automationSequences.organizationId, org))
      .orderBy(desc(automationSequences.createdAt));
    if (seqs.length === 0) return [];

    const ids = seqs.map((s) => s.id);
    const [steps, enrollments] = await Promise.all([
      ctx.db.select().from(automationSteps).where(inArray(automationSteps.sequenceId, ids)).orderBy(asc(automationSteps.stepOrder)),
      ctx.db.select().from(automationEnrollments).where(inArray(automationEnrollments.sequenceId, ids)),
    ]);

    return seqs.map((s) => {
      const stepRows = steps.filter((st) => st.sequenceId === s.id);
      const enr = enrollments.filter((e) => e.sequenceId === s.id);
      return {
        id: s.id,
        name: s.name,
        trigger: s.trigger,
        active: s.active,
        steps: stepRows.map((st) => ({ subject: st.subject, body: st.body, delayDays: st.delayDays })),
        enrolled: enr.length,
        sent: enr.reduce((n, e) => n + e.sentCount, 0),
        completed: enr.filter((e) => e.status === "completed").length,
      };
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(160),
        trigger: z.enum(TRIGGERS).default("manual"),
        steps: z
          .array(
            z.object({
              subject: z.string().min(1).max(200),
              body: z.string().min(1).max(20000),
              delayDays: z.number().int().min(0).max(365).default(0),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const seqId = crypto.randomUUID();
      await ctx.db.insert(automationSequences).values({
        id: seqId,
        organizationId: org,
        name: input.name,
        trigger: input.trigger,
      });
      await ctx.db.insert(automationSteps).values(
        input.steps.map((st, i) => ({
          id: crypto.randomUUID(),
          organizationId: org,
          sequenceId: seqId,
          stepOrder: i,
          delayDays: st.delayDays,
          subject: st.subject,
          body: st.body,
        })),
      );
      return { id: seqId };
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.string().min(1), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(automationSequences)
        .set({ active: input.active })
        .where(and(eq(automationSequences.id, input.id), eq(automationSequences.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Sequence not found." });
      return { id: updated.id, active: updated.active };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(automationSequences)
        .where(and(eq(automationSequences.id, input.id), eq(automationSequences.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Sequence not found." });
      return { id: deleted.id };
    }),

  /**
   * Enroll all active members not already in the sequence and send the FIRST
   * step immediately (through the comms marketing policy). Later steps are
   * scheduled by a future runner; this proves the pipeline end-to-end today.
   */
  enroll: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const [seq] = await ctx.db
        .select()
        .from(automationSequences)
        .where(and(eq(automationSequences.id, input.id), eq(automationSequences.organizationId, org)))
        .limit(1);
      if (!seq) throw new TRPCError({ code: "NOT_FOUND", message: "Sequence not found." });

      const [firstStep] = await ctx.db
        .select()
        .from(automationSteps)
        .where(eq(automationSteps.sequenceId, seq.id))
        .orderBy(asc(automationSteps.stepOrder))
        .limit(1);
      if (!firstStep) throw new TRPCError({ code: "BAD_REQUEST", message: "Sequence has no steps." });

      const [orgRow] = await ctx.db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, org))
        .limit(1);
      const orgName = orgRow?.name ?? "Vytal";

      const members = await ctx.db
        .select({ email: gymMembers.email })
        .from(gymMembers)
        .where(and(eq(gymMembers.organizationId, org), eq(gymMembers.status, "active")));
      const existing = new Set(
        (
          await ctx.db
            .select({ email: automationEnrollments.memberEmail })
            .from(automationEnrollments)
            .where(eq(automationEnrollments.sequenceId, seq.id))
        ).map((r) => r.email),
      );

      let enrolled = 0;
      let sent = 0;
      let skipped = 0;
      for (const m of members) {
        if (existing.has(m.email)) continue;
        const decision = await applyMarketingEmailPolicy({
          db: ctx.db,
          organizationId: org,
          orgName,
          baseUrl: baseUrl(),
          email: m.email,
          subject: firstStep.subject,
          html: firstStep.body,
        });
        let stepSent = 0;
        if (!decision.blocked) {
          try {
            await sendEmail({ to: m.email, subject: decision.subject, html: decision.html, tags: ["automation", seq.id] });
            stepSent = 1;
            sent += 1;
          } catch {
            /* counted as enrolled but not sent */
          }
        } else {
          skipped += 1;
        }
        await ctx.db.insert(automationEnrollments).values({
          id: crypto.randomUUID(),
          organizationId: org,
          sequenceId: seq.id,
          memberEmail: m.email,
          currentStep: 1,
          status: "active",
          sentCount: stepSent,
          lastSentAt: stepSent ? new Date() : null,
        });
        enrolled += 1;
      }
      return { enrolled, sent, skipped };
    }),
});
