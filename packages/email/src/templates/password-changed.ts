import { resolveTemplateId, type Locale } from "../config/templates";

export interface PasswordChangedEmailParams {
  /** Recipient display name. */
  name: string;
  /** ISO-8601 timestamp of the change. */
  changedAt: string;
  /** Optional IP address shown for context. */
  ipAddress?: string;
  /** "If this wasn't you, contact support" link. */
  supportUrl: string;
  /** Optional locale; defaults to English. */
  locale?: Locale;
}

/** Build the `{ templateId, params }` payload for the password-changed tripwire mail. */
export function passwordChangedEmail(p: PasswordChangedEmailParams): {
  templateId: number;
  params: {
    name: string;
    changed_at: string;
    ip_address?: string;
    support_url: string;
  };
} {
  return {
    templateId: resolveTemplateId("password-changed", p.locale),
    params: {
      name: p.name,
      changed_at: p.changedAt,
      ip_address: p.ipAddress,
      support_url: p.supportUrl,
    },
  };
}
