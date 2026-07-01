import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { communityComments, communityPosts, communityReactions } from "@vytal-fit/db";
import { hasMinRole, type UserRole } from "@vytal-fit/shared";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

/** Map the caller's org role to the badge shown next to their name. */
function badgeFor(role: UserRole | null): "owner" | "coach" | "athlete" {
  if (role === "owner" || role === "admin") return "owner";
  if (role === "coach") return "coach";
  return "athlete";
}

const isStaff = (role: UserRole | null) => hasMinRole(role ?? "athlete", "coach");

export const communityRouter = router({
  /**
   * The feed: pinned posts first, then newest. Each post carries its reaction
   * count, whether the caller reacted, and its comment count.
   */
  feed: orgProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(60) }).default({ limit: 60 }))
    .query(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const posts = await ctx.db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.organizationId, org))
        .orderBy(desc(communityPosts.pinned), desc(communityPosts.createdAt))
        .limit(input.limit);
      if (posts.length === 0) return [];

      const ids = posts.map((p) => p.id);
      const actorId = ctx.session!.user.id;
      const [reactions, comments] = await Promise.all([
        ctx.db
          .select({ postId: communityReactions.postId, actorId: communityReactions.actorId })
          .from(communityReactions)
          .where(inArray(communityReactions.postId, ids)),
        ctx.db
          .select({ postId: communityComments.postId })
          .from(communityComments)
          .where(inArray(communityComments.postId, ids)),
      ]);

      const reactCount = new Map<string, number>();
      const reacted = new Set<string>();
      for (const r of reactions) {
        reactCount.set(r.postId, (reactCount.get(r.postId) ?? 0) + 1);
        if (r.actorId === actorId) reacted.add(r.postId);
      }
      const commentCount = new Map<string, number>();
      for (const c of comments) commentCount.set(c.postId, (commentCount.get(c.postId) ?? 0) + 1);

      return posts.map((p) => ({
        id: p.id,
        authorName: p.authorName,
        authorType: p.authorType,
        kind: p.kind,
        content: p.content,
        pinned: p.pinned,
        createdAt: p.createdAt,
        fistbumps: reactCount.get(p.id) ?? 0,
        hasReacted: reacted.has(p.id),
        commentCount: commentCount.get(p.id) ?? 0,
      }));
    }),

  /** Create a post. Anyone in the org can post; only staff may announce. */
  post: orgProcedure
    .input(
      z.object({
        content: z.string().min(1).max(2000),
        kind: z.enum(["post", "announcement"]).default("post"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const kind = input.kind === "announcement" && !isStaff(ctx.session!.role) ? "post" : input.kind;
      const [created] = await ctx.db
        .insert(communityPosts)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          authorUserId: ctx.session!.user.id,
          authorName: ctx.session!.user.name,
          authorType: badgeFor(ctx.session!.role),
          kind,
          content: input.content,
        })
        .returning();
      return created;
    }),

  /** Toggle the caller's fistbump on a post. Returns the new count + state. */
  react: orgProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const actorId = ctx.session!.user.id;
      const [existing] = await ctx.db
        .select({ id: communityReactions.id })
        .from(communityReactions)
        .where(and(eq(communityReactions.postId, input.postId), eq(communityReactions.actorId, actorId)))
        .limit(1);
      if (existing) {
        await ctx.db.delete(communityReactions).where(eq(communityReactions.id, existing.id));
        return { reacted: false };
      }
      // Guard: the post must belong to the caller's org.
      const [post] = await ctx.db
        .select({ id: communityPosts.id })
        .from(communityPosts)
        .where(and(eq(communityPosts.id, input.postId), eq(communityPosts.organizationId, org)))
        .limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      await ctx.db.insert(communityReactions).values({
        id: crypto.randomUUID(),
        organizationId: org,
        postId: input.postId,
        actorId,
      });
      return { reacted: true };
    }),

  /** Comments for a post, oldest first. */
  comments: orgProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: communityComments.id,
          authorName: communityComments.authorName,
          authorType: communityComments.authorType,
          content: communityComments.content,
          createdAt: communityComments.createdAt,
        })
        .from(communityComments)
        .where(
          and(
            eq(communityComments.postId, input.postId),
            eq(communityComments.organizationId, ctx.activeOrganizationId),
          ),
        )
        .orderBy(communityComments.createdAt);
    }),

  comment: orgProcedure
    .input(z.object({ postId: z.string().min(1), content: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const [post] = await ctx.db
        .select({ id: communityPosts.id })
        .from(communityPosts)
        .where(and(eq(communityPosts.id, input.postId), eq(communityPosts.organizationId, org)))
        .limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      const [created] = await ctx.db
        .insert(communityComments)
        .values({
          id: crypto.randomUUID(),
          organizationId: org,
          postId: input.postId,
          authorUserId: ctx.session!.user.id,
          authorName: ctx.session!.user.name,
          authorType: badgeFor(ctx.session!.role),
          content: input.content,
        })
        .returning();
      return created;
    }),

  /** Pin/unpin a post (staff only) — used for announcements. */
  pin: staffProcedure
    .input(z.object({ id: z.string().min(1), pinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(communityPosts)
        .set({ pinned: input.pinned })
        .where(
          and(
            eq(communityPosts.id, input.id),
            eq(communityPosts.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      return { id: updated.id, pinned: updated.pinned };
    }),

  /** Delete a post. Author can delete their own; staff can delete any. */
  deletePost: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const [post] = await ctx.db
        .select({ id: communityPosts.id, authorUserId: communityPosts.authorUserId })
        .from(communityPosts)
        .where(and(eq(communityPosts.id, input.id), eq(communityPosts.organizationId, org)))
        .limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      const own = post.authorUserId === ctx.session!.user.id;
      if (!own && !isStaff(ctx.session!.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed to delete this post." });
      }
      await ctx.db.delete(communityPosts).where(eq(communityPosts.id, input.id));
      return { id: input.id };
    }),

  /** Delete a comment. Author can delete their own; staff can delete any. */
  deleteComment: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const [c] = await ctx.db
        .select({ id: communityComments.id, authorUserId: communityComments.authorUserId })
        .from(communityComments)
        .where(and(eq(communityComments.id, input.id), eq(communityComments.organizationId, org)))
        .limit(1);
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found." });
      const own = c.authorUserId === ctx.session!.user.id;
      if (!own && !isStaff(ctx.session!.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed to delete this comment." });
      }
      await ctx.db.delete(communityComments).where(eq(communityComments.id, input.id));
      return { id: input.id };
    }),
});
