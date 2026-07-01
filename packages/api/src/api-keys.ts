/**
 * API-key helpers: generation, hashing, and resolving a raw key into an
 * org-scoped session context. Only the SHA-256 hash is ever stored.
 */
import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { apiKeys } from "@vytal-fit/db";
import type { Context, SessionContext } from "./trpc";

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a new key: `vk_live_<40 hex>`. Returns the plaintext + its parts. */
export function generateApiKey(): { key: string; prefix: string; last4: string; hash: string } {
  const secret = randomBytes(20).toString("hex"); // 40 hex chars
  const key = `vk_live_${secret}`;
  return {
    key,
    prefix: key.slice(0, 12), // "vk_live_a1b2"
    last4: key.slice(-4),
    hash: hashApiKey(key),
  };
}

/** Extract a `vk_...` key from an Authorization: Bearer header. */
export function extractApiKey(headers: Headers): string | null {
  const auth = headers.get("authorization") ?? headers.get("Authorization");
  if (!auth) return null;
  const m = /^Bearer\s+(vk_[A-Za-z0-9_]+)$/.exec(auth.trim());
  return m ? m[1] : null;
}

/**
 * Resolve a raw API key into a synthetic, org-scoped session context. The key
 * acts with `owner` rights inside its organization. Returns null if the key is
 * unknown or revoked. Also stamps `lastUsedAt` (best-effort).
 */
export async function resolveApiKeySession(
  db: Context["db"],
  rawKey: string,
): Promise<SessionContext | null> {
  const hash = hashApiKey(rawKey);
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)))
    .limit(1);
  if (!row) return null;

  // Best-effort last-used stamp (don't block the request on it).
  void db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));

  return {
    user: {
      id: `apikey:${row.id}`,
      email: `${row.prefix}@apikey.vytal.fit`,
      name: row.name,
      emailVerified: true,
    },
    activeOrganizationId: row.organizationId,
    role: "owner",
  };
}
