// Provider-agnostic types. Must not reference a specific vendor SDK — that's
// what `providers/<name>.ts` is for.

interface SendEmailBase {
  /** Recipient(s). */
  to: string | string[];
  /** Defaults to EMAIL_REPLY_TO if set. */
  replyTo?: string;
  /** Provider tags for filtering in vendor dashboards. */
  tags?: string[];
  /** From override; defaults to EMAIL_FROM. Must be a verified sender. */
  from?: string;
}

/** Inline HTML payload — for ad-hoc mail without a registered vendor template. */
export interface SendEmailInlineHtml extends SendEmailBase {
  subject: string;
  html: string;
  text?: string;
  templateId?: never;
  params?: never;
}

/** Vendor-template payload — provider renders templateId with params. Preferred path. */
export interface SendEmailTemplate extends SendEmailBase {
  templateId: number;
  params: Record<string, unknown>;
  subject?: never;
  html?: never;
  text?: never;
}

/** Discriminated by the presence of `templateId`. */
export type SendEmailParams = SendEmailInlineHtml | SendEmailTemplate;

export function isTemplatePayload(p: SendEmailParams): p is SendEmailTemplate {
  return typeof (p as SendEmailTemplate).templateId === "number";
}

export interface SendEmailResult {
  /** Vendor message id when the SDK returns one — persist to correlate webhooks. */
  id?: string;
  provider: string;
  /** "sent" → handed off; "logged" → dev fallback, no provider configured; "skipped" → suppressed. */
  status: "sent" | "logged" | "skipped";
}

export interface EmailProvider {
  /** Stable id, surfaced in `SendEmailResult`. */
  readonly name: string;
  /** Whether the provider can actually deliver (e.g. has an API key); send.ts falls back to console-log when false. */
  readonly isConfigured: boolean;
  send(params: SendEmailParams): Promise<SendEmailResult>;
}
