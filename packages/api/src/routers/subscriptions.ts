import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  classTypes,
  gymMembers,
  PLAN_TYPES,
  SUBSCRIPTION_STATUSES,
  subscriptionPlans,
  subscriptions,
} from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router } from "../trpc";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const planInput = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(PLAN_TYPES),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default("EUR"),
  sessionsPerWeek: z.number().int().positive().optional(),
  maxSessions: z.number().int().positive().optional(),
  allowedClassTypes: z.array(z.string().min(1)).default([]),
  active: z.boolean().default(true),
});

const subscriptionInput = z.object({
  memberId: z.string().min(1),
  planId: z.string().min(1),
  startDate: dateString,
  endDate: dateString.optional(),
  status: z.enum(SUBSCRIPTION_STATUSES).default("active"),
  sessionsUsed: z.number().int().nonnegative().optional(),
  nextBillingDate: dateString.optional(),
});

export const subscriptionsRouter = router({
  plans: router({
    list: orgProcedure
      .input(z.object({ activeOnly: z.boolean().default(false) }).default({ activeOnly: false }))
      .query(async ({ ctx, input }) => {
        return ctx.db
          .select()
          .from(subscriptionPlans)
          .where(
            and(
              eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
              input.activeOnly ? eq(subscriptionPlans.active, true) : undefined,
            ),
          )
          .orderBy(asc(subscriptionPlans.name));
      }),

    create: orgProcedure.input(planInput).mutation(async ({ ctx, input }) => {
      // Every allowed class type must belong to the active org.
      for (const classTypeId of input.allowedClassTypes) {
        const [classType] = await ctx.db
          .select({ id: classTypes.id })
          .from(classTypes)
          .where(
            and(
              eq(classTypes.id, classTypeId),
              eq(classTypes.organizationId, ctx.activeOrganizationId),
            ),
          )
          .limit(1);
        if (!classType) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Class type not found." });
        }
      }

      const [created] = await ctx.db
        .insert(subscriptionPlans)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          ...input,
          price: input.price.toFixed(2),
        })
        .returning();
      return created;
    }),
  }),

  list: orgProcedure
    .input(z.object({ status: z.enum(SUBSCRIPTION_STATUSES).optional() }).default({}))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.organizationId, ctx.activeOrganizationId),
            input.status ? eq(subscriptions.status, input.status) : undefined,
          ),
        )
        .orderBy(desc(subscriptions.startDate));
    }),

  byMember: orgProcedure
    .input(z.object({ memberId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
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

      return ctx.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.organizationId, ctx.activeOrganizationId),
            eq(subscriptions.memberId, input.memberId),
          ),
        )
        .orderBy(desc(subscriptions.startDate));
    }),

  create: orgProcedure.input(subscriptionInput).mutation(async ({ ctx, input }) => {
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

    const [plan] = await ctx.db
      .select({ id: subscriptionPlans.id })
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.id, input.planId),
          eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
        ),
      )
      .limit(1);
    if (!plan) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found." });
    }

    const [created] = await ctx.db
      .insert(subscriptions)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        ...input,
      })
      .returning();
    return created;
  }),
});
