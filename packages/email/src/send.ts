/** Single entry point for transactional mail. Routes both payload shapes through the active provider. */
import { getActiveProvider } from "./registry";
import { isTemplatePayload, type SendEmailParams, type SendEmailResult } from "./types";

export type { SendEmailParams, SendEmailResult } from "./types";

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const provider = getActiveProvider();
  const from = params.from ?? process.env.EMAIL_FROM;
  const replyTo = params.replyTo ?? process.env.EMAIL_REPLY_TO;

  // Dev fallback — log instead of send when no provider is configured.
  if (!provider.isConfigured) {
    const recipients = Array.isArray(params.to) ? params.to.join(", ") : params.to;
    const lines: (string | null)[] = [
      `─── [@vytal-fit/email] provider "${provider.name}" not configured — would have sent ───`,
      `From:     ${from ?? "(EMAIL_FROM unset)"}`,
      `To:       ${recipients}`,
      replyTo ? `Reply-To: ${replyTo}` : null,
      params.tags?.length ? `Tags:     ${params.tags.join(", ")}` : null,
    ];
    if (isTemplatePayload(params)) {
      lines.push(`Template: #${params.templateId}`);
      lines.push("Params:");
      lines.push(JSON.stringify(params.params, null, 2));
    } else {
      lines.push(`Subject:  ${params.subject}`);
      lines.push("");
      lines.push(params.text ?? params.html);
    }
    lines.push("──────────────────────────────────────────────────────────────");
    // eslint-disable-next-line no-console
    console.log(lines.filter(Boolean).join("\n"));
    return { provider: provider.name, status: "logged" };
  }

  if (!from) {
    throw new Error(
      "EMAIL_FROM is not set. Add it to apps/pro/.env.local — e.g. " +
        '`EMAIL_FROM="Vytal <vytal.fit.eu@gmail.com>"`. The sender address ' +
        "must also be verified with the active email provider.",
    );
  }

  return provider.send(params);
}
