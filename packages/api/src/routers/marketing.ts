import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { socialPosts } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const PLATFORMS = ["instagram", "facebook", "linkedin"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const marketingRouter = router({
  /** Scheduled/published/draft social posts for the org, soonest first. */
  posts: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(socialPosts.scheduledDate));
  }),

  create: staffProcedure
    .input(
      z.object({
        platform: z.enum(PLATFORMS),
        content: z.string().min(1).max(3000),
        scheduledDate: z.string().regex(DATE_RE),
        scheduledTime: z.string().min(1).max(10).default("09:00"),
        imageLabel: z.string().max(120).optional(),
        status: z.enum(["draft", "scheduled"]).default("scheduled"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(socialPosts)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          platform: input.platform,
          content: input.content,
          scheduledDate: input.scheduledDate,
          scheduledTime: input.scheduledTime,
          status: input.status,
          imageLabel: input.imageLabel ?? null,
          createdBy: ctx.session?.user.name ?? null,
        })
        .returning();
      return created;
    }),

  /** Mark a post published (real platform publishing via OAuth is a later step). */
  setStatus: staffProcedure
    .input(z.object({ id: z.string().min(1), status: z.enum(["draft", "scheduled", "published"]) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(socialPosts)
        .set({ status: input.status })
        .where(and(eq(socialPosts.id, input.id), eq(socialPosts.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      return { id: updated.id, status: updated.status };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(socialPosts)
        .where(and(eq(socialPosts.id, input.id), eq(socialPosts.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      return { id: deleted.id };
    }),
});
