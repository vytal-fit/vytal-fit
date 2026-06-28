import { resolveTemplateId, type Locale } from "../config/templates";

export interface VerificationEmailParams {
  /** The recipient's display name. */
  name: string;
  /** Signed verification URL produced by Better Auth. */
  verifyUrl: string;
  /** Optional locale; defaults to English. */
  locale?: Locale;
}

/** Build the `{ templateId, params }` payload for the email-verification mail. */
export function verificationEmail(p: VerificationEmailParams): {
  templateId: number;
  params: {
    name: string;
    verify_url: string;
  };
} {
  return {
    templateId: resolveTemplateId("verification", p.locale),
    params: {
      name: p.name,
      verify_url: p.verifyUrl,
    },
  };
}
