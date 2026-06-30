import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { conversations, messages } from "@vytal-fit/db";
import { z } from "zod";
import { orgProcedure, router, staffProcedure } from "../trpc";

/** Two-letter initials from a contact name (e.g. "Ana Sousa" -> "AS"). */
function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const messagesRouter = router({
  /**
   * Every conversation in the org with its full message thread, newest thread
   * first. Each conversation carries a derived unread count (inbound messages
   * not yet read by staff).
   */
  conversations: orgProcedure.query(async ({ ctx }) => {
    const convs = await ctx.db
      .select()
      .from(conversations)
      .where(eq(conversations.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(conversations.lastMessageAt));

    if (convs.length === 0) return [];

    const msgs = await ctx.db
      .select()
      .from(messages)
      .where(eq(messages.organizationId, ctx.activeOrganizationId))
      .orderBy(asc(messages.createdAt));

    const byConv = new Map<string, typeof msgs>();
    for (const m of msgs) {
      const list = byConv.get(m.conversationId);
      if (list) list.push(m);
      else byConv.set(m.conversationId, [m]);
    }

    return convs.map((c) => {
      const thread = byConv.get(c.id) ?? [];
      return {
        id: c.id,
        memberId: c.memberId,
        contactName: c.contactName,
        contactInitials: initials(c.contactName),
        contactStatus: c.contactStatus,
        online: c.online,
        lastMessageAt: c.lastMessageAt,
        unreadCount: thread.filter((m) => !m.fromStaff && !m.read).length,
        messages: thread.map((m) => ({
          id: m.id,
          body: m.body,
          fromStaff: m.fromStaff,
          createdAt: m.createdAt,
        })),
      };
    });
  }),

  /** Append a staff reply to a conversation and bump its last-message time. */
  send: staffProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
        body: z.string().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [conv] = await ctx.db
        .select({ id: conversations.id })
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!conv) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found." });
      }

      const now = new Date();
      const [created] = await ctx.db
        .insert(messages)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          conversationId: input.conversationId,
          body: input.body,
          fromStaff: true,
          read: true,
          createdAt: now,
        })
        .returning();

      await ctx.db
        .update(conversations)
        .set({ lastMessageAt: now })
        .where(eq(conversations.id, input.conversationId));

      return created;
    }),

  /** Mark every inbound message in a conversation as read. */
  markRead: staffProcedure
    .input(z.object({ conversationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [conv] = await ctx.db
        .select({ id: conversations.id })
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!conv) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found." });
      }

      const rows = await ctx.db
        .update(messages)
        .set({ read: true })
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.organizationId, ctx.activeOrganizationId),
            eq(messages.fromStaff, false),
            eq(messages.read, false),
          ),
        )
        .returning({ id: messages.id });
      return { updated: rows.length };
    }),
});
