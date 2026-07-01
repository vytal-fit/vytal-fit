import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import {
  campaigns,
  gymMembers,
  memberGroupMembers,
  organization,
} from "@vytal-fit/db";
import { applyMarketingEmailPolicy } from "@vytal-fit/comms";
import { sendEmail } from "@vytal-fit/email";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "https://api.vytal.fit";
}

/** Resolve a campaign's audience to a list of { email } recipients. */
async function resolveRecipients(
  db: import("../trpc").Context["db"],
  orgId: string,
  audience: string,
): Promise<{ email: string }[]> {
  if (audience.startsWith("group:")) {
    const groupId = audience.slice("group:".length);
    return db
      .select({ email: gymMembers.email })
      .from(memberGroupMembers)
      .innerJoin(gymMembers, eq(gymMembers.id, memberGroupMembers.memberId))
      .where(and(eq(memberGroupMembers.groupId, groupId), eq(gymMembers.organizationId, orgId)));
  }
  return db
    .select({ email: gymMembers.email })
    .from(gymMembers)
    .where(and(eq(gymMembers.organizationId, orgId), eq(gymMembers.status, "active")));
}

export const campaignsRouter = router({
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(campaigns)
      .where(eq(campaigns.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(campaigns.createdAt));
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(160),
        subject: z.string().min(1).max(200),
        body: z.string().min(1).max(20000),
        audience: z.string().min(1).default("all_active"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(campaigns)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          name: input.name,
          subject: input.subject,
          body: input.body,
          audience: input.audience,
          createdBy: ctx.session?.user.id ?? null,
        })
        .returning();
      return created;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(campaigns)
        .where(and(eq(campaigns.id, input.id), eq(campaigns.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });
      return { id: deleted.id };
    }),

  /**
   * Send a draft campaign. Every recipient passes the comms marketing policy
   * (suppression + unsubscribe footer); we then hand off to the email
   * transport. Counters + status are stamped when done.
   */
  send: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const [campaign] = await ctx.db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.id, input.id), eq(campaigns.organizationId, org)))
        .limit(1);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });
      if (campaign.status === "sent") {
        throw new TRPCError({ code: "CONFLICT", message: "Campaign already sent." });
      }

      const [orgRow] = await ctx.db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, org))
        .limit(1);
      const orgName = orgRow?.name ?? "Vytal";

      const recipients = await resolveRecipients(ctx.db, org, campaign.audience);
      let sent = 0;
      let skipped = 0;
      let failed = 0;

      for (const r of recipients) {
        const decision = await applyMarketingEmailPolicy({
          db: ctx.db,
          organizationId: org,
          orgName,
          baseUrl: baseUrl(),
          email: r.email,
          subject: campaign.subject,
          html: campaign.body,
        });
        if (decision.blocked) {
          skipped += 1;
          continue;
        }
        try {
          await sendEmail({
            to: r.email,
            subject: decision.subject,
            html: decision.html,
            tags: ["campaign", campaign.id],
          });
          sent += 1;
        } catch {
          failed += 1;
        }
      }

      const [updated] = await ctx.db
        .update(campaigns)
        .set({ status: "sent", sentCount: sent, skippedCount: skipped, failedCount: failed, sentAt: new Date() })
        .where(eq(campaigns.id, campaign.id))
        .returning();
      return { id: updated.id, sent, skipped, failed, total: recipients.length };
    }),
});
