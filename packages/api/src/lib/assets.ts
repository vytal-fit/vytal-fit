import { createHmac, timingSafeEqual } from "node:crypto";
import { objectStore } from "./storage";

// Image assets use an unforgeable, HMAC-signed capability-URL model: assets
// render where we can't auth-gate (consumer app, mobile), so the HMAC signature
// is the access control, NOT the URL. DB columns store `/api/asset/<token>`
// where <token> is `base64url(key).base64url(hmac)`. The serve route verifies the
// HMAC then confines the embedded key to its OWN tenant prefix (via getKey) so a
// token can never resolve another tenant's asset, a traversal, or an arbitrary scheme.
//
// Key scheme (single tenant level — organizationId):
//   users/{userId}/avatar/{uuid}.{ext}                     ← personal avatar
//   orgs/{organizationId}/branding/logo-{uuid}.{ext}       ← gym logo
//   orgs/{organizationId}/members/{memberId}/{uuid}.{ext}  ← gym member photo
//   orgs/{organizationId}/coaches/{coachId}/{uuid}.{ext}   ← coach photo

export const ASSET_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AssetImageType = (typeof ASSET_IMAGE_TYPES)[number];

export const MAX_ASSET_IMAGE_BYTES = 8 * 1024 * 1024;

const EXT: Record<AssetImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAssetImageType(t: string): t is AssetImageType {
  return (ASSET_IMAGE_TYPES as readonly string[]).includes(t);
}

/** Decode a data URL (or raw base64 + provided type) into bytes + content type. */
export function decodeImagePayload(input: {
  dataUrl?: string;
  base64?: string;
  contentType?: string;
}): { bytes: Buffer; contentType: AssetImageType } {
  let contentType = input.contentType ?? "";
  let b64 = input.base64 ?? "";

  if (input.dataUrl) {
    const m = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(input.dataUrl);
    if (!m) throw new Error("invalid_data_url");
    contentType = m[1];
    b64 = m[3];
  }
  if (!isAssetImageType(contentType)) throw new Error("unsupported_image_type");

  const bytes = Buffer.from(b64, "base64");
  if (bytes.length === 0) throw new Error("empty_image");
  if (bytes.length > MAX_ASSET_IMAGE_BYTES) throw new Error("image_too_large");
  return { bytes, contentType };
}

// ── Key shape validation + tenant prefixes ───────────────────────────────────
const FILE = `[^/]+\\.(jpg|png|webp)`;
const USER_AVATAR_RE = new RegExp(`^users/[^/]+/avatar/${FILE}$`);
const ORG_LOGO_RE = new RegExp(`^orgs/[^/]+/branding/logo-${FILE}$`);
const ORG_MEMBER_RE = new RegExp(`^orgs/[^/]+/members/[^/]+/${FILE}$`);
const ORG_COACH_RE = new RegExp(`^orgs/[^/]+/coaches/[^/]+/${FILE}$`);

/** True for any of the four well-formed Vytal asset key shapes, no traversal. */
export function isAssetKey(key: string): boolean {
  if (key.split("/").includes("..")) return false;
  return (
    USER_AVATAR_RE.test(key) ||
    ORG_LOGO_RE.test(key) ||
    ORG_MEMBER_RE.test(key) ||
    ORG_COACH_RE.test(key)
  );
}

/** The traversal-confinement prefix for an asset key — its own tenant scope
 *  (members/coaches confine to 4 path segments, avatars/branding to 3). */
function assetPrefix(key: string): string {
  const parts = key.split("/");
  const segments =
    parts[0] === "orgs" && (parts[2] === "members" || parts[2] === "coaches")
      ? 4
      : 3;
  return parts.slice(0, segments).join("/") + "/";
}

// ── HMAC capability token (`base64url(key).base64url(hmac)`) ─────────────────
// Reuses BETTER_AUTH_SECRET (present in every server runtime) — server-side only.
function signingSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) throw new Error("BETTER_AUTH_SECRET is not set");
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function keySignature(key: string): Buffer {
  return createHmac("sha256", signingSecret()).update(key).digest();
}

/** Build the public, HMAC-signed capability token for an asset storage key. */
export function assetToken(key: string): string {
  return `${b64url(Buffer.from(key, "utf8"))}.${b64url(keySignature(key))}`;
}

/** Verify a token and recover the storage key, or null if forged/malformed. */
export function keyFromAssetToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  let key: string;
  let sig: Buffer;
  try {
    key = fromB64url(token.slice(0, dot)).toString("utf8");
    sig = fromB64url(token.slice(dot + 1));
  } catch {
    return null;
  }
  if (!isAssetKey(key)) return null;
  const expected = keySignature(key);
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  return key;
}

/** Encode a storage key into the public, signed serve URL. */
export function assetUrl(key: string): string {
  return `/api/asset/${assetToken(key)}`;
}

function contentTypeForKey(key: string): string {
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function userAvatarKey(userId: string, contentType: AssetImageType): string {
  return `users/${userId}/avatar/${crypto.randomUUID()}.${EXT[contentType]}`;
}

function orgLogoKey(orgId: string, contentType: AssetImageType): string {
  return `orgs/${orgId}/branding/logo-${crypto.randomUUID()}.${EXT[contentType]}`;
}

function memberPhotoKey(orgId: string, memberId: string, contentType: AssetImageType): string {
  return `orgs/${orgId}/members/${memberId}/${crypto.randomUUID()}.${EXT[contentType]}`;
}

function coachPhotoKey(orgId: string, coachId: string, contentType: AssetImageType): string {
  return `orgs/${orgId}/coaches/${coachId}/${crypto.randomUUID()}.${EXT[contentType]}`;
}

// Store helpers put with addRandomSuffix:false (key already carries a UUID) and
// return the signed serve URL — the raw store ref never leaves the server.
export async function storeUserAvatar(args: {
  userId: string;
  bytes: Buffer;
  contentType: AssetImageType;
}): Promise<string> {
  const key = userAvatarKey(args.userId, args.contentType);
  await objectStore().put(key, args.bytes, args.contentType, { addRandomSuffix: false });
  return assetUrl(key);
}

export async function storeOrgLogo(args: {
  orgId: string;
  bytes: Buffer;
  contentType: AssetImageType;
}): Promise<string> {
  const key = orgLogoKey(args.orgId, args.contentType);
  await objectStore().put(key, args.bytes, args.contentType, { addRandomSuffix: false });
  return assetUrl(key);
}

export async function storeMemberPhoto(args: {
  orgId: string;
  memberId: string;
  bytes: Buffer;
  contentType: AssetImageType;
}): Promise<string> {
  const key = memberPhotoKey(args.orgId, args.memberId, args.contentType);
  await objectStore().put(key, args.bytes, args.contentType, { addRandomSuffix: false });
  return assetUrl(key);
}

export async function storeCoachPhoto(args: {
  orgId: string;
  coachId: string;
  bytes: Buffer;
  contentType: AssetImageType;
}): Promise<string> {
  const key = coachPhotoKey(args.orgId, args.coachId, args.contentType);
  await objectStore().put(key, args.bytes, args.contentType, { addRandomSuffix: false });
  return assetUrl(key);
}

/** Resolve a token to bytes: verifies the HMAC and confines the key to its own
 *  tenant prefix. Throws on any failure (route maps to 404). */
export async function fetchAssetByToken(
  token: string,
): Promise<{ bytes: Buffer; contentType: string }> {
  const key = keyFromAssetToken(token);
  if (!key) throw new Error("invalid_asset_token");
  const bytes = await objectStore().getKey(key, assetPrefix(key));
  return { bytes, contentType: contentTypeForKey(key) };
}
