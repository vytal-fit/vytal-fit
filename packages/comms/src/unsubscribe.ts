/**
 * Unsubscribe token + footer. The token is a signed, unauthenticated round-trip
 * (HMAC keyed on BETTER_AUTH_SECRET) so a recipient can opt out from an email
 * link without logging in. Also the canonical footer + HTML escaper for email
 * chrome. Reads an env var (IO), so this lives in `comms`, never in `shared`.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  return process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex").slice(0, 32);
}

/** `<org>:<email>:<sig>`, base64url. Opaque to the recipient, verifiable by us. */
export function unsubscribeToken(organizationId: string, email: string): string {
  const payload = `${organizationId}:${email.trim().toLowerCase()}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString("base64url");
}

export function verifyUnsubscribeToken(
  token: string,
): { organizationId: string; email: string } | null {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const idx = decoded.lastIndexOf(":");
  if (idx < 0) return null;
  const payload = decoded.slice(0, idx);
  const sig = decoded.slice(idx + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [organizationId, email] = payload.split(":");
  if (!organizationId || !email) return null;
  return { organizationId, email };
}

export function unsubscribeUrl(baseUrl: string, organizationId: string, email: string): string {
  return `${baseUrl.replace(/\/$/, "")}/unsubscribe?token=${unsubscribeToken(organizationId, email)}`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Append the required unsubscribe footer to a marketing email body. */
export function withUnsubscribeFooter(html: string, url: string, orgName: string): string {
  return `${html}
<hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb" />
<p style="font-size:12px;color:#6b7280;margin-top:12px">
  ${escapeHtml(orgName)} · <a href="${url}" style="color:#6b7280">Unsubscribe</a>
</p>`;
}
