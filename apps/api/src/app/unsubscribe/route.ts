/**
 * Public, unauthenticated unsubscribe endpoint. A recipient clicks the link in
 * a marketing email; we verify the signed token and add them to the org's
 * suppression list. No login required (that's the whole point).
 */
import { verifyUnsubscribeToken } from "@vytal-fit/comms";
import { getDb, suppressEmail } from "@vytal-fit/db";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

function page(title: string, message: string, ok: boolean): Response {
  const color = ok ? "#22c55e" : "#ef4444";
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="font-family:system-ui,sans-serif;background:#0b0f0c;color:#dceee0;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
  <div style="text-align:center;max-width:420px;padding:32px">
    <div style="font-size:40px;color:${color}">${ok ? "✓" : "×"}</div>
    <h1 style="font-size:20px;margin:12px 0">${title}</h1>
    <p style="color:#6b8c72;font-size:14px">${message}</p>
  </div>
</body></html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return page("Invalid link", "This unsubscribe link is missing its token.", false);

  const parsed = verifyUnsubscribeToken(token);
  if (!parsed) return page("Invalid link", "This unsubscribe link is invalid or expired.", false);

  if (!isBackendConfigured()) {
    return page("Unavailable", "The service is temporarily unavailable. Please try again later.", false);
  }

  try {
    await suppressEmail(getDb(), parsed.organizationId, parsed.email, "unsubscribe");
  } catch {
    return page("Something went wrong", "We couldn't process your request. Please try again.", false);
  }
  return page(
    "You're unsubscribed",
    `${parsed.email} will no longer receive marketing emails from this organization.`,
    true,
  );
}
