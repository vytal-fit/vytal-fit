import { describe, it, expect } from "vitest";
import {
  unsubscribeToken,
  verifyUnsubscribeToken,
  unsubscribeUrl,
  withUnsubscribeFooter,
  escapeHtml,
} from "../src/unsubscribe";

describe("unsubscribe token round-trip", () => {
  it("signs and verifies a token", () => {
    const token = unsubscribeToken("org-1", "Jose@Example.com");
    const parsed = verifyUnsubscribeToken(token);
    expect(parsed).toEqual({ organizationId: "org-1", email: "jose@example.com" });
  });

  it("rejects a tampered token", () => {
    const token = unsubscribeToken("org-1", "a@b.com");
    const tampered = Buffer.from(
      Buffer.from(token, "base64url").toString("utf8").replace("org-1", "org-2"),
    ).toString("base64url");
    expect(verifyUnsubscribeToken(tampered)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyUnsubscribeToken("not-a-token")).toBeNull();
  });

  it("builds an unsubscribe URL with the token", () => {
    const url = unsubscribeUrl("https://api.vytal.fit/", "org-1", "a@b.com");
    expect(url.startsWith("https://api.vytal.fit/unsubscribe?token=")).toBe(true);
  });

  it("escapes HTML and appends a footer with the link", () => {
    expect(escapeHtml('<b>"x"</b>')).toBe("&lt;b&gt;&quot;x&quot;&lt;/b&gt;");
    const html = withUnsubscribeFooter("<p>Hi</p>", "https://x/unsubscribe?token=t", "Box & Co");
    expect(html).toContain("<p>Hi</p>");
    expect(html).toContain("https://x/unsubscribe?token=t");
    expect(html).toContain("Box &amp; Co");
  });
});
