import { TRPCError } from "@trpc/server";
import { and, desc, eq, max } from "drizzle-orm";
import { supportTickets } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";

const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const TICKET_PRIORITIES = ["high", "medium", "low"] as const;

const ticketInput = z.object({
  memberName: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
  assignedTo: z.string().min(1).max(200).default("Unassigned"),
});

export const supportTicketsRouter = router({
  list: adminProcedure
    .input(
      z
        .object({
          status: z.enum(TICKET_STATUSES).optional(),
          limit: z.number().int().min(1).max(100).default(100),
        })
        .default({ limit: 100 }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.organizationId, ctx.activeOrganizationId),
            input.status ? eq(supportTickets.status, input.status) : undefined,
          ),
        )
        .orderBy(desc(supportTickets.createdAt))
        .limit(input.limit);
    }),

  create: adminProcedure.input(ticketInput).mutation(async ({ ctx, input }) => {
    const [maxRow] = await ctx.db
      .select({ value: max(supportTickets.number) })
      .from(supportTickets)
      .where(eq(supportTickets.organizationId, ctx.activeOrganizationId));

    const [created] = await ctx.db
      .insert(supportTickets)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        number: Number(maxRow?.value ?? 1000) + 1,
        status: "open",
        priority: input.priority,
        assignedTo: input.assignedTo,
        memberName: input.memberName,
        subject: input.subject,
        description: input.description,
        messages: [],
        internalNotes: "",
      })
      .returning();
    return created;
  }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string().min(1), status: z.enum(TICKET_STATUSES) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(supportTickets)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(supportTickets.id, input.id),
            eq(supportTickets.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Support ticket not found." });
      }
      return updated;
    }),
});
