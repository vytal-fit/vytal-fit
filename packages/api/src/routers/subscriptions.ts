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
import { hasMinRole } from "@vytal-fit/shared";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

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

/**
 * Update payload: `planInput` with the `.default()`s stripped — a defaulted
 * field inside `.partial()` would otherwise coerce `undefined` back to its
 * default and silently reset stored values on partial updates.
 */
const planUpdateInput = planInput
  .extend({
    currency: z.string().length(3),
    allowedClassTypes: z.array(z.string().min(1)),
    active: z.boolean(),
  })
  .partial();

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

    create: adminProcedure.input(planInput).mutation(async ({ ctx, input }) => {
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

    /**
     * Partial update of a plan (name/price/active/…). Activate/deactivate is
     * just `data: { active }` — no separate procedure.
     */
    update: adminProcedure
      .input(z.object({ id: z.string().min(1), data: planUpdateInput }))
      .mutation(async ({ ctx, input }) => {
        // Re-fetch scoped to the org before mutating — never trust a client id.
        const [existing] = await ctx.db
          .select({ id: subscriptionPlans.id })
          .from(subscriptionPlans)
          .where(
            and(
              eq(subscriptionPlans.id, input.id),
              eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
            ),
          )
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found." });
        }

        // Every allowed class type must belong to the active org.
        for (const classTypeId of input.data.allowedClassTypes ?? []) {
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

        const { price, ...rest } = input.data;
        const [updated] = await ctx.db
          .update(subscriptionPlans)
          .set({
            ...rest,
            ...(price !== undefined ? { price: price.toFixed(2) } : {}),
          })
          .where(
            and(
              eq(subscriptionPlans.id, input.id),
              eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
            ),
          )
          .returning();
        return updated;
      }),

    /**
     * Hard delete of a plan. `subscriptions.planId` is FK `restrict`, so a
     * plan referenced by ANY subscription (active or historical) is rejected
     * with CONFLICT instead of leaking a raw FK violation — member
     * subscriptions are never orphaned or cascade-deleted. To retire a plan
     * that has history, set `active: false` via `update` instead.
     */
    delete: adminProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const [existing] = await ctx.db
          .select({ id: subscriptionPlans.id })
          .from(subscriptionPlans)
          .where(
            and(
              eq(subscriptionPlans.id, input.id),
              eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
            ),
          )
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found." });
        }

        const referencing = await ctx.db
          .select({ status: subscriptions.status })
          .from(subscriptions)
          // By planId alone (not org-scoped): the FK is `restrict` regardless
          // of org, so any reference must surface as CONFLICT, never a raw
          // FK violation.
          .where(eq(subscriptions.planId, input.id));
        const activeCount = referencing.filter((s) => s.status === "active").length;
        if (activeCount > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Plan has ${activeCount} active subscription${activeCount === 1 ? "" : "s"}. Cancel or move them first, or deactivate the plan instead.`,
          });
        }
        if (referencing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Plan is referenced by ${referencing.length} past subscription${referencing.length === 1 ? "" : "s"}. Deactivate the plan instead of deleting it.`,
          });
        }

        const [deleted] = await ctx.db
          .delete(subscriptionPlans)
          .where(
            and(
              eq(subscriptionPlans.id, input.id),
              eq(subscriptionPlans.organizationId, ctx.activeOrganizationId),
            ),
          )
          .returning();
        if (!deleted) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found." });
        }
        return deleted;
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
        .select({ id: gymMembers.id, userId: gymMembers.userId })
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
      // Athletes may only read their own member's subscriptions.
      if (
        !ctx.session?.role ||
        (!hasMinRole(ctx.session.role, "coach") && member.userId !== ctx.session.user.id)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Athletes can only read their own subscriptions.",
        });
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

  create: adminProcedure.input(subscriptionInput).mutation(async ({ ctx, input }) => {
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
