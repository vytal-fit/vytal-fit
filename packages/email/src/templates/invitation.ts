import { resolveTemplateId, type Locale } from "../config/templates";

export interface InvitationEmailParams {
  /** Display name of the user sending the invite. */
  inviterName: string;
  /** Vytal organisation (gym) name. */
  organizationName: string;
  /** Role label the recipient will receive (e.g. "coach", "athlete"). */
  role: string;
  /** Fully-qualified invite acceptance URL. */
  inviteUrl: string;
  /** Optional locale; defaults to English. */
  locale?: Locale;
}

/** Build the `{ templateId, params }` payload for the invitation email. */
export function invitationEmail(p: InvitationEmailParams): {
  templateId: number;
  params: {
    inviter_name: string;
    organization_name: string;
    role: string;
    invite_url: string;
  };
} {
  return {
    templateId: resolveTemplateId("invitation", p.locale),
    params: {
      inviter_name: p.inviterName,
      organization_name: p.organizationName,
      role: p.role,
      invite_url: p.inviteUrl,
    },
  };
}
