import { describe, it, expect } from "vitest";
import {
  TEMPLATES,
  resolveTemplateId,
  verificationEmail,
  passwordResetEmail,
  passwordChangedEmail,
  welcomeEmail,
  invitationEmail,
  invitationAcceptedEmail,
} from "@vytal-fit/email";

describe("resolveTemplateId", () => {
  it("defaults to the EN id when no locale is given", () => {
    expect(resolveTemplateId("verification", undefined)).toBe(TEMPLATES.verification.en);
  });

  it("returns the locale-specific id", () => {
    expect(resolveTemplateId("welcome", "pt")).toBe(TEMPLATES.welcome.pt);
    expect(resolveTemplateId("welcome", "es")).toBe(TEMPLATES.welcome.es);
  });

  it("covers all six template types in all three locales", () => {
    const types = Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[];
    expect(types).toHaveLength(6);
    for (const type of types) {
      for (const locale of ["en", "pt", "es"] as const) {
        expect(typeof TEMPLATES[type][locale]).toBe("number");
      }
    }
  });
});

describe("template builders map to snake_case Brevo params", () => {
  it("verificationEmail", () => {
    const r = verificationEmail({ name: "Ana", verifyUrl: "https://app/verify/abc" });
    expect(r.templateId).toBe(TEMPLATES.verification.en);
    expect(r.params).toEqual({ name: "Ana", verify_url: "https://app/verify/abc" });
  });

  it("passwordResetEmail honors locale", () => {
    const r = passwordResetEmail({ name: "João", resetUrl: "https://app/reset/x", locale: "pt" });
    expect(r.templateId).toBe(TEMPLATES["password-reset"].pt);
    expect(r.params).toEqual({ name: "João", reset_url: "https://app/reset/x" });
  });

  it("passwordChangedEmail", () => {
    const r = passwordChangedEmail({
      name: "Ana",
      changedAt: "2026-06-28T10:00:00.000Z",
      supportUrl: "https://app/support",
    });
    expect(r.params).toMatchObject({
      name: "Ana",
      changed_at: "2026-06-28T10:00:00.000Z",
      support_url: "https://app/support",
    });
  });

  it("welcomeEmail", () => {
    const r = welcomeEmail({ name: "Ana", appUrl: "https://app", organizationName: "CrossFit Aveiro" });
    expect(r.params).toEqual({
      name: "Ana",
      app_url: "https://app",
      organization_name: "CrossFit Aveiro",
    });
  });

  it("invitationEmail", () => {
    const r = invitationEmail({
      inviterName: "Founder",
      organizationName: "CrossFit Aveiro",
      role: "coach",
      inviteUrl: "https://app/invite/1",
    });
    expect(r.params).toEqual({
      inviter_name: "Founder",
      organization_name: "CrossFit Aveiro",
      role: "coach",
      invite_url: "https://app/invite/1",
    });
  });

  it("invitationAcceptedEmail", () => {
    const r = invitationAcceptedEmail({
      inviterName: "Founder",
      memberName: "Ana",
      memberEmail: "ana@example.com",
      organizationName: "CrossFit Aveiro",
      role: "athlete",
      teamUrl: "https://app/team",
    });
    expect(r.params).toMatchObject({
      inviter_name: "Founder",
      member_name: "Ana",
      member_email: "ana@example.com",
      organization_name: "CrossFit Aveiro",
      role: "athlete",
      team_url: "https://app/team",
    });
  });
});
