// Single source of truth for which templates Vytal sends, their Brevo ids per
// (type × locale), and the params shape each expects. HTML source mirrors
// `brevo-templates/{en,pt,es}/<type>.html`.

export type Locale = "en" | "pt" | "es";

/** Each variant's `params` (snake_case) is substituted via Brevo `{{ params.X }}` placeholders. */
export type EmailTemplate =
  | {
      type: "invitation";
      params: {
        inviter_name: string;
        organization_name: string;
        role: string;
        invite_url: string;
      };
    }
  | {
      type: "verification";
      params: {
        name: string;
        verify_url: string;
      };
    }
  | {
      type: "password-reset";
      params: {
        name: string;
        reset_url: string;
      };
    }
  | {
      type: "welcome";
      params: {
        name: string;
        app_url: string;
        organization_name?: string;
      };
    }
  | {
      type: "password-changed";
      params: {
        name: string;
        changed_at: string;
        ip_address?: string;
        support_url: string;
      };
    }
  | {
      type: "invitation-accepted";
      params: {
        inviter_name: string;
        member_name: string;
        member_email: string;
        organization_name: string;
        role: string;
        team_url: string;
      };
    };

export type EmailTemplateType = EmailTemplate["type"];

// Brevo numeric template IDs by (type, locale). NOTE: values are PLACEHOLDERS —
// `npm run brevo:sync` creates the templates in Brevo and overwrites these.
export const TEMPLATES: Record<EmailTemplateType, Record<Locale, number>> = {
  "invitation":          { en: 1 , pt: 2 , es: 3  },
  "verification":        { en: 4 , pt: 5 , es: 6  },
  "password-reset":      { en: 7 , pt: 8 , es: 9  },
  "welcome":             { en: 10, pt: 11, es: 12 },
  "password-changed":    { en: 13, pt: 14, es: 15 },
  "invitation-accepted": { en: 16, pt: 17, es: 18 },
};

/** Look up the Brevo template ID for a (type, locale) pair; defaults to en. */
export function resolveTemplateId(
  type: EmailTemplateType,
  locale: Locale | undefined,
): number {
  return TEMPLATES[type][locale ?? "en"];
}
