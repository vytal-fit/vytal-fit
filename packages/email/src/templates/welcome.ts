import { resolveTemplateId, type Locale } from "../config/templates";

export interface WelcomeEmailParams {
  /** Recipient display name. */
  name: string;
  /** Where to point the "open Vytal" CTA. Usually a dashboard URL. */
  appUrl: string;
  /** Optional gym name to personalise the welcome copy. */
  organizationName?: string;
  /** Optional locale; defaults to English. */
  locale?: Locale;
}

/** Build the `{ templateId, params }` payload for the welcome mail (founder + invitee paths). */
export function welcomeEmail(p: WelcomeEmailParams): {
  templateId: number;
  params: {
    name: string;
    app_url: string;
    organization_name?: string;
  };
} {
  return {
    templateId: resolveTemplateId("welcome", p.locale),
    params: {
      name: p.name,
      app_url: p.appUrl,
      organization_name: p.organizationName,
    },
  };
}
