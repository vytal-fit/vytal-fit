import type { EmailProvider } from "./types";
import { brevoProvider } from "./providers/brevo";
import { mockProvider } from "./providers/mock";

export const DEFAULT_PROVIDER = "brevo";

const providers: Record<string, EmailProvider> = {
  brevo: brevoProvider,
  mock: mockProvider, // test harness — EMAIL_PROVIDER=mock captures sends in-memory
};

/** Resolves the provider named by `EMAIL_PROVIDER` (defaults to Brevo); throws on an unknown name. */
export function getActiveProvider(): EmailProvider {
  const name = process.env.EMAIL_PROVIDER || DEFAULT_PROVIDER;
  const provider = providers[name];
  if (!provider) {
    const valid = Object.keys(providers).join(", ");
    throw new Error(
      `Unknown EMAIL_PROVIDER="${name}". Valid options: ${valid}. ` +
        "To register a new provider, add it to the map in " +
        "packages/email/src/registry.ts.",
    );
  }
  return provider;
}
