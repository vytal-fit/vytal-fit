// In-memory mock provider for tests. EMAIL_PROVIDER=mock captures every send
// into an array. isConfigured stays true so sendEmail never falls through to the
// dev console-log path when a test omits a secret.
import type { EmailProvider, SendEmailParams, SendEmailResult } from "../types";

let sent: SendEmailParams[] = [];
let counter = 0;

export const mockProvider: EmailProvider = {
  name: "mock",
  isConfigured: true,
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    sent.push({ ...params } as SendEmailParams);
    counter += 1;
    return { id: `mock-${counter}`, provider: "mock", status: "sent" };
  },
};

/** Returns every email captured since the last {@link resetMockEmails} call. */
export function getSentEmails(): SendEmailParams[] {
  return sent;
}

/** Empties the buffer. Call in `beforeEach` to isolate test cases. */
export function resetMockEmails(): void {
  sent = [];
  counter = 0;
}
