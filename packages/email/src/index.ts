// @vytal-fit/email — transactional email. Provider-agnostic: vendor selected via
// EMAIL_PROVIDER (default "brevo"). Server-side env: EMAIL_PROVIDER, EMAIL_FROM
// (verified sender, required), EMAIL_REPLY_TO (optional), BREVO_API_KEY.
export { sendEmail } from "./send";
export type { SendEmailParams, SendEmailResult } from "./send";
export type { EmailProvider } from "./types";

// Test surface — production code should not touch these.
export { mockProvider, getSentEmails, resetMockEmails } from "./providers/mock";

export {
  TEMPLATES,
  resolveTemplateId,
  type EmailTemplate,
  type EmailTemplateType,
  type Locale,
} from "./config/templates";

export { verificationEmail } from "./templates/verification";
export type { VerificationEmailParams } from "./templates/verification";

export { passwordResetEmail } from "./templates/password-reset";
export type { PasswordResetEmailParams } from "./templates/password-reset";

export { invitationEmail } from "./templates/invitation";
export type { InvitationEmailParams } from "./templates/invitation";

export { welcomeEmail } from "./templates/welcome";
export type { WelcomeEmailParams } from "./templates/welcome";

export { passwordChangedEmail } from "./templates/password-changed";
export type { PasswordChangedEmailParams } from "./templates/password-changed";

export { invitationAcceptedEmail } from "./templates/invitation-accepted";
export type { InvitationAcceptedEmailParams } from "./templates/invitation-accepted";
