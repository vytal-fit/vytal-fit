import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { gymMembers, GENDERS, MEMBER_STATUSES } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const memberInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  photo: z.string().url().optional(),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nif: z.string().max(20).optional(),
  emergencyContact: z.string().max(200).optional(),
  status: z.enum(MEMBER_STATUSES).default("active"),
  planId: z.string().min(1).optional(),
});

export const membersRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          status: z.enum(MEMBER_STATUSES).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
            input.status ? eq(gymMembers.status, input.status) : undefined,
            input.cursor ? gt(gymMembers.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(gymMembers.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }
      return row;
    }),

  create: adminProcedure.input(memberInput).mutation(async ({ ctx, input }) => {
    const [last] = await ctx.db
      .select({ memberNumber: gymMembers.memberNumber })
      .from(gymMembers)
      .where(eq(gymMembers.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(gymMembers.memberNumber))
      .limit(1);

    const [created] = await ctx.db
      .insert(gymMembers)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        memberNumber: (last?.memberNumber ?? 0) + 1,
        ...input,
      })
      .returning();
    return created;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string().min(1), data: memberInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      // Re-fetch scoped to the org before mutating — never trust a client id.
      const [existing] = await ctx.db
        .select({ id: gymMembers.id })
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }

      const [updated] = await ctx.db
        .update(gymMembers)
        .set(input.data)
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      return updated;
    }),

  archive: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [archived] = await ctx.db
        .update(gymMembers)
        .set({ status: "inactive" })
        .where(
          and(
            eq(gymMembers.id, input.id),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!archived) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }
      return archived;
    }),
});
