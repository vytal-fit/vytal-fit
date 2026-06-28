import { resolveTemplateId, type Locale } from "../config/templates";

export interface InvitationAcceptedEmailParams {
  /** Display name of the inviter (the recipient of this email). */
  inviterName: string;
  /** Display name of the new member who just accepted. */
  memberName: string;
  /** Email of the new member. */
  memberEmail: string;
  /** Organisation (gym) the new member joined. */
  organizationName: string;
  /** Role they accepted at (e.g. "coach", "athlete"). */
  role: string;
  /** Deep link to the team page so the inviter can review the new member. */
  teamUrl: string;
  /** Optional locale; defaults to English. */
  locale?: Locale;
}

/** Build the `{ templateId, params }` payload for the "X joined your gym" notification to the inviter. */
export function invitationAcceptedEmail(p: InvitationAcceptedEmailParams): {
  templateId: number;
  params: {
    inviter_name: string;
    member_name: string;
    member_email: string;
    organization_name: string;
    role: string;
    team_url: string;
  };
} {
  return {
    templateId: resolveTemplateId("invitation-accepted", p.locale),
    params: {
      inviter_name: p.inviterName,
      member_name: p.memberName,
      member_email: p.memberEmail,
      organization_name: p.organizationName,
      role: p.role,
      team_url: p.teamUrl,
    },
  };
}
