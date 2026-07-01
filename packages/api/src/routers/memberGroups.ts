import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { gymMembers, memberGroupMembers, memberGroups } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const groupInput = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export const memberGroupsRouter = router({
  /** Org member groups, each with its members (id/name/email). */
  list: orgProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db
      .select()
      .from(memberGroups)
      .where(eq(memberGroups.organizationId, ctx.activeOrganizationId));

    if (groups.length === 0) return [];

    const links = await ctx.db
      .select({
        groupId: memberGroupMembers.groupId,
        memberId: gymMembers.id,
        name: gymMembers.name,
        email: gymMembers.email,
      })
      .from(memberGroupMembers)
      .innerJoin(gymMembers, eq(gymMembers.id, memberGroupMembers.memberId))
      .where(
        inArray(
          memberGroupMembers.groupId,
          groups.map((g) => g.id),
        ),
      );

    const byGroup = new Map<string, { id: string; name: string; email: string }[]>();
    for (const l of links) {
      const arr = byGroup.get(l.groupId) ?? [];
      arr.push({ id: l.memberId, name: l.name, email: l.email });
      byGroup.set(l.groupId, arr);
    }

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? "",
      color: g.color,
      members: byGroup.get(g.id) ?? [],
    }));
  }),

  create: staffProcedure.input(groupInput).mutation(async ({ ctx, input }) => {
    const [created] = await ctx.db
      .insert(memberGroups)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? "#22c55e",
      })
      .returning();
    return created;
  }),

  update: staffProcedure
    .input(groupInput.partial().extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      const [updated] = await ctx.db
        .update(memberGroups)
        .set({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.color !== undefined ? { color: patch.color } : {}),
        })
        .where(
          and(eq(memberGroups.id, id), eq(memberGroups.organizationId, ctx.activeOrganizationId)),
        )
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Group not found." });
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(memberGroups)
        .where(
          and(
            eq(memberGroups.id, input.id),
            eq(memberGroups.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Group not found." });
      return { id: deleted.id };
    }),
});
