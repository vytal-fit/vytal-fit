import { createHmac, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { webhookDeliveries, webhooks } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const WEBHOOK_EVENTS = [
  "member.created",
  "member.updated",
  "payment.success",
  "payment.failed",
  "class.booked",
  "class.cancelled",
  "lead.created",
  "wod.published",
] as const;

function generateSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

function successRate(success: number, failure: number): number {
  const total = success + failure;
  return total === 0 ? 100 : Math.round((success / total) * 100);
}

/**
 * Fire one signed delivery to an endpoint (real HTTP, 5s timeout). Returns the
 * outcome; never throws on network/HTTP errors (they become ok:false).
 */
async function deliver(
  url: string,
  secret: string,
  event: string,
  payload: unknown,
): Promise<{ statusCode: number | null; ok: boolean; responseMs: number; body: string }> {
  const body = JSON.stringify({ event, data: payload, sentAt: new Date().toISOString() });
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vytal-event": event,
        "x-vytal-signature": `sha256=${signature}`,
      },
      body,
      signal: controller.signal,
    });
    return { statusCode: res.status, ok: res.ok, responseMs: Date.now() - started, body };
  } catch {
    return { statusCode: null, ok: false, responseMs: Date.now() - started, body };
  } finally {
    clearTimeout(timer);
  }
}

const maskSecret = (s: string) => `${s.slice(0, 11)}····${s.slice(-4)}`;

/**
 * Fire-and-forget: deliver a domain event to every ACTIVE endpoint in the org
 * that subscribes to it, logging each attempt. Never blocks or throws — the
 * caller's mutation is unaffected. Endpoints are off by default, so this is a
 * no-op (zero cost) until an org opts in. Durable/queued delivery is a future
 * upgrade; today it's best-effort inline.
 */
export function dispatchWebhooks(
  ctx: { db: import("../trpc").Context["db"]; session: { activeOrganizationId: string | null } | null },
  event: string,
  payload: unknown,
): void {
  const orgId = ctx.session?.activeOrganizationId;
  if (!orgId) return;
  void (async () => {
    try {
      const active = await ctx.db
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.organizationId, orgId), eq(webhooks.active, true)));
      const targets = active.filter((w) => w.events.includes(event));
      for (const wh of targets) {
        const result = await deliver(wh.url, wh.secret, event, payload);
        await ctx.db.insert(webhookDeliveries).values({
          id: crypto.randomUUID(),
          organizationId: orgId,
          webhookId: wh.id,
          event,
          statusCode: result.statusCode,
          ok: result.ok,
          responseMs: result.responseMs,
          payload: result.body,
        });
        await ctx.db
          .update(webhooks)
          .set({
            lastTriggeredAt: new Date(),
            successCount: result.ok ? wh.successCount + 1 : wh.successCount,
            failureCount: result.ok ? wh.failureCount : wh.failureCount + 1,
          })
          .where(eq(webhooks.id, wh.id));
      }
    } catch {
      // Best-effort: swallow so the triggering mutation is never affected.
    }
  })();
}

export const webhooksRouter = router({
  events: orgProcedure.query(() => [...WEBHOOK_EVENTS]),

  list: orgProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(webhooks)
      .where(eq(webhooks.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(webhooks.createdAt));
    return rows.map((w) => ({
      id: w.id,
      name: w.name,
      url: w.url,
      events: w.events,
      active: w.active,
      lastTriggeredAt: w.lastTriggeredAt,
      successRate: successRate(w.successCount, w.failureCount),
      secretMasked: maskSecret(w.secret),
    }));
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(120),
        url: z.string().url(),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const secret = generateSecret();
      const [created] = await ctx.db
        .insert(webhooks)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          name: input.name,
          url: input.url,
          events: input.events,
          secret,
        })
        .returning();
      // Signing secret shown once (like the receiver-side shared secret).
      return { id: created.id, name: created.name, secret };
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.string().min(1), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(webhooks)
        .set({ active: input.active })
        .where(and(eq(webhooks.id, input.id), eq(webhooks.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found." });
      return { id: updated.id, active: updated.active };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found." });
      return { id: deleted.id };
    }),

  /** Send a real signed test event to the endpoint and log the delivery. */
  test: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [wh] = await ctx.db
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.organizationId, ctx.activeOrganizationId)))
        .limit(1);
      if (!wh) throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found." });

      const result = await deliver(wh.url, wh.secret, "test.ping", {
        message: "Test delivery from Vytal",
        organizationId: ctx.activeOrganizationId,
      });

      await ctx.db.insert(webhookDeliveries).values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        webhookId: wh.id,
        event: "test.ping",
        statusCode: result.statusCode,
        ok: result.ok,
        responseMs: result.responseMs,
        payload: result.body,
      });
      await ctx.db
        .update(webhooks)
        .set({
          lastTriggeredAt: new Date(),
          successCount: result.ok ? wh.successCount + 1 : wh.successCount,
          failureCount: result.ok ? wh.failureCount : wh.failureCount + 1,
        })
        .where(eq(webhooks.id, wh.id));

      return { ok: result.ok, statusCode: result.statusCode, responseMs: result.responseMs };
    }),

  deliveries: orgProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).default({ limit: 50 }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: webhookDeliveries.id,
          webhookName: webhooks.name,
          event: webhookDeliveries.event,
          statusCode: webhookDeliveries.statusCode,
          ok: webhookDeliveries.ok,
          responseMs: webhookDeliveries.responseMs,
          payload: webhookDeliveries.payload,
          createdAt: webhookDeliveries.createdAt,
        })
        .from(webhookDeliveries)
        .innerJoin(webhooks, eq(webhooks.id, webhookDeliveries.webhookId))
        .where(eq(webhookDeliveries.organizationId, ctx.activeOrganizationId))
        .orderBy(desc(webhookDeliveries.createdAt))
        .limit(input.limit);
      return rows;
    }),
});
