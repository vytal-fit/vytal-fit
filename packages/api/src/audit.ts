/**
 * Audit trail helper. Writes to the DB, so per the layering rule it lives in
 * `api` (not the pure `shared` layer). Fire-and-forget: an audit write must
 * never fail or slow the mutation it records.
 */
import { auditLogs } from "@vytal-fit/db";
import type { Context } from "./trpc";

export interface AuditInput {
  action: string;
  resource: string;
  details: string;
  expandedDetails?: string;
}

/**
 * Record an audit entry for the caller's action. Never throws: errors are
 * swallowed so the surrounding mutation is unaffected. No-op without a session.
 */
export function recordAudit(ctx: Context, input: AuditInput): void {
  const orgId = ctx.session?.activeOrganizationId;
  const actorName = ctx.session?.user.name;
  if (!orgId || !actorName) return;
  void ctx.db
    .insert(auditLogs)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      actorName,
      action: input.action,
      resource: input.resource,
      details: input.details,
      expandedDetails: input.expandedDetails ?? null,
    })
    .then(
      () => undefined,
      () => undefined,
    );
}
