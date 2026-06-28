import { resolveTemplateId, type Locale } from "../config/templates";

export interface PasswordResetEmailParams {
  /** Recipient display name. */
  name: string;
  /** Signed reset URL produced by Better Auth. */
  resetUrl: string;
  /** Optional locale; defaults to English. */
  locale?: Locale;
}

/** Build the `{ templateId, params }` payload for the password-reset mail. */
export function passwordResetEmail(p: PasswordResetEmailParams): {
  templateId: number;
  params: {
    name: string;
    reset_url: string;
  };
} {
  return {
    templateId: resolveTemplateId("password-reset", p.locale),
    params: {
      name: p.name,
      reset_url: p.resetUrl,
    },
  };
}
