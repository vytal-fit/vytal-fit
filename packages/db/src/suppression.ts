/**
 * Email suppression-list accessors. Per the layering rule, table access lives
 * in `db` — the comms policy layer *calls* these; it does not define them.
 */
import { and, eq } from "drizzle-orm";
import type { Database } from "./client";
import { emailSuppressions } from "./schema";

/** Canonical form for comparison: trimmed + lower-cased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** True if this address is on the org's suppression list. */
export async function isSuppressed(
  db: Database,
  organizationId: string,
  email: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: emailSuppressions.id })
    .from(emailSuppressions)
    .where(
      and(
        eq(emailSuppressions.organizationId, organizationId),
        eq(emailSuppressions.email, normalizeEmail(email)),
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** Add an address to the org's suppression list (idempotent). */
export async function suppressEmail(
  db: Database,
  organizationId: string,
  email: string,
  reason = "unsubscribe",
): Promise<void> {
  await db
    .insert(emailSuppressions)
    .values({
      id: crypto.randomUUID(),
      organizationId,
      email: normalizeEmail(email),
      reason,
    })
    .onConflictDoNothing();
}
