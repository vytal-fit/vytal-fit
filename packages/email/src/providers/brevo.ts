// Brevo provider. v5 SDK exposes a single `BrevoClient`; transactional surface is
// `client.transactionalEmails.sendTransacEmail`. Client is created lazily so the
// package imports in dev without BREVO_API_KEY.
import { BrevoClient } from "@getbrevo/brevo";
import {
  isTemplatePayload,
  type EmailProvider,
  type SendEmailParams,
  type SendEmailResult,
} from "../types";

interface ParsedAddress {
  email: string;
  name?: string;
}

/** Parses "Display Name <email@example.com>" → { name, email }. */
function parseAddress(raw: string): ParsedAddress {
  const match = raw.match(/^\s*(.+?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1], email: match[2] };
  }
  return { email: raw.trim() };
}

function toRecipients(to: string | string[]): ParsedAddress[] {
  const list = Array.isArray(to) ? to : [to];
  return list.map(parseAddress);
}

/** Factory so the lazy client cache is instance-scoped (easier in tests). */
export function createBrevoProvider(): EmailProvider {
  let cached: BrevoClient | null = null;

  function getClient(): BrevoClient {
    if (cached) return cached;
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error(
        "BREVO_API_KEY is not set. Add it to apps/pro/.env.local — see " +
          "https://app.brevo.com → Settings → SMTP & API → API Keys.",
      );
    }
    cached = new BrevoClient({ apiKey });
    return cached;
  }

  return {
    name: "brevo",
    get isConfigured() {
      return Boolean(process.env.BREVO_API_KEY);
    },
    async send(params: SendEmailParams): Promise<SendEmailResult> {
      const from = params.from ?? process.env.EMAIL_FROM;
      if (!from) {
        // send.ts guards this too, but a provider should be safe called directly.
        throw new Error(
          "EMAIL_FROM is not set. Add it to apps/pro/.env.local — e.g. " +
            '`EMAIL_FROM="Vytal <vytal.fit.eu@gmail.com>"`. The sender address ' +
            "must also be verified in Brevo (Senders, Domains & Dedicated IPs).",
        );
      }

      const sender = parseAddress(from);
      const replyTo = params.replyTo ?? process.env.EMAIL_REPLY_TO;
      const client = getClient();

      const baseRequest = {
        sender: { email: sender.email, name: sender.name },
        to: toRecipients(params.to),
        replyTo: replyTo ? parseAddress(replyTo) : undefined,
        tags: params.tags,
      };

      const request = isTemplatePayload(params)
        ? {
            ...baseRequest,
            templateId: params.templateId,
            params: params.params,
          }
        : {
            ...baseRequest,
            subject: params.subject,
            htmlContent: params.html,
            textContent: params.text,
          };

      const response = await client.transactionalEmails.sendTransacEmail(request);

      // Older SDK builds nest messageId under `.body`; fall back gracefully.
      const id =
        (response as { messageId?: string })?.messageId ??
        (response as { body?: { messageId?: string } })?.body?.messageId;

      return { id, provider: "brevo", status: "sent" };
    },
  };
}

/** Default singleton — what the registry consumes. */
export const brevoProvider: EmailProvider = createBrevoProvider();
