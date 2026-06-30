import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { expenses, EXPENSE_CATEGORIES } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const expenseInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(EXPENSE_CATEGORIES),
  subcategory: z.string().min(1).max(120),
  amount: z.number().nonnegative(),
  method: z.string().min(1).max(60),
  description: z.string().max(500).optional(),
  hasReceipt: z.boolean().default(false),
});

export const expensesRouter = router({
  /** Org expense ledger, newest first. Optionally filtered by category. */
  list: orgProcedure
    .input(
      z
        .object({ category: z.enum(EXPENSE_CATEGORIES).optional() })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, ctx.activeOrganizationId),
            input.category ? eq(expenses.category, input.category) : undefined,
          ),
        )
        .orderBy(desc(expenses.date));
    }),

  create: staffProcedure.input(expenseInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(expenses)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        date: input.date,
        category: input.category,
        subcategory: input.subcategory,
        amount: input.amount.toFixed(2),
        method: input.method,
        description: input.description ?? null,
        hasReceipt: input.hasReceipt,
      })
      .returning();
    return created;
  }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(expenses)
        .where(
          and(
            eq(expenses.id, input.id),
            eq(expenses.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found." });
      }
      return deleted;
    }),
});
