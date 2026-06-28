import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  sendEmail,
  getSentEmails,
  resetMockEmails,
  verificationEmail,
} from "@vytal-fit/email";

const originalEnv = { ...process.env };

beforeEach(() => {
  resetMockEmails();
  process.env.EMAIL_PROVIDER = "mock";
  process.env.EMAIL_FROM = "Vytal <test@vytal.fit>";
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("sendEmail (mock provider)", () => {
  it('returns status="sent" and captures the payload', async () => {
    const built = verificationEmail({ name: "Ana", verifyUrl: "https://app/verify/abc" });
    const result = await sendEmail({ to: "ana@example.com", ...built, tags: ["verification"] });

    expect(result).toEqual({
      provider: "mock",
      status: "sent",
      id: expect.stringMatching(/^mock-\d+$/),
    });

    const sent = getSentEmails();
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("ana@example.com");
    expect(sent[0]!.tags).toEqual(["verification"]);
  });

  it("increments the mock id across sends", async () => {
    const built = verificationEmail({ name: "A", verifyUrl: "u" });
    const a = await sendEmail({ to: "a@x.com", ...built });
    const b = await sendEmail({ to: "b@x.com", ...built });
    expect(a.id).toBe("mock-1");
    expect(b.id).toBe("mock-2");
  });
});

describe("sendEmail (unconfigured brevo provider)", () => {
  it('falls back to console-log and returns status="logged"', async () => {
    process.env.EMAIL_PROVIDER = "brevo";
    delete process.env.BREVO_API_KEY;

    const built = verificationEmail({ name: "Ana", verifyUrl: "https://app" });
    const result = await sendEmail({ to: "ana@example.com", ...built });

    expect(result).toMatchObject({ provider: "brevo", status: "logged" });
    // Nothing is captured by the mock buffer on the logged path.
    expect(getSentEmails()).toHaveLength(0);
  });
});

describe("sendEmail (misconfiguration)", () => {
  it("throws a useful error when EMAIL_FROM is unset with a configured provider", async () => {
    process.env.EMAIL_PROVIDER = "mock";
    delete process.env.EMAIL_FROM;

    const built = verificationEmail({ name: "Ana", verifyUrl: "https://app" });
    await expect(sendEmail({ to: "ana@example.com", ...built })).rejects.toThrow(/EMAIL_FROM/);
  });

  it("throws on an unknown EMAIL_PROVIDER", async () => {
    process.env.EMAIL_PROVIDER = "nope";
    const built = verificationEmail({ name: "Ana", verifyUrl: "https://app" });
    await expect(sendEmail({ to: "ana@example.com", ...built })).rejects.toThrow(/Unknown EMAIL_PROVIDER/);
  });
});
