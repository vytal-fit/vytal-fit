/**
 * The single marketing-send policy gate. Every marketing email passes through
 * here: it reads suppression state (via `db` accessors) and composes the final
 * body with the required unsubscribe footer. It GATES and COMPOSES — it never
 * sends (the caller in `api` does that via `@vytal-fit/email`).
 */
import { isSuppressed, type Database } from "@vytal-fit/db";
import { unsubscribeUrl, withUnsubscribeFooter } from "./unsubscribe";

export interface MarketingEmailInput {
  db: Database;
  organizationId: string;
  orgName: string;
  /** Public base URL for the unsubscribe link (e.g. https://api.vytal.fit). */
  baseUrl: string;
  email: string;
  subject: string;
  html: string;
}

export type MarketingEmailDecision =
  | { blocked: true; reason: "suppressed" }
  | { blocked: false; subject: string; html: string };

/**
 * Returns a `blocked` decision (recipient suppressed) or the composed
 * `{ subject, html }` with the unsubscribe footer appended.
 */
export async function applyMarketingEmailPolicy(
  input: MarketingEmailInput,
): Promise<MarketingEmailDecision> {
  if (await isSuppressed(input.db, input.organizationId, input.email)) {
    return { blocked: true, reason: "suppressed" };
  }
  const url = unsubscribeUrl(input.baseUrl, input.organizationId, input.email);
  return {
    blocked: false,
    subject: input.subject,
    html: withUnsubscribeFooter(input.html, url, input.orgName),
  };
}
