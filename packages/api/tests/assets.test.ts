/**
 * Asset key + HMAC capability-token unit tests. These guard the security
 * boundary: a token can only resolve a well-formed key under its own tenant
 * prefix, and a forged/tampered token never verifies.
 */
import { beforeAll, describe, expect, it } from "vitest";
import {
  decodeImagePayload,
  isAssetKey,
  assetToken,
  keyFromAssetToken,
  assetUrl,
  MAX_ASSET_IMAGE_BYTES,
} from "../src/lib/assets";

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long";
});

// 1x1 transparent PNG.
const PNG_1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("decodeImagePayload", () => {
  it("decodes a data URL", () => {
    const { bytes, contentType } = decodeImagePayload({ dataUrl: `data:image/png;base64,${PNG_1x1}` });
    expect(contentType).toBe("image/png");
    expect(bytes.length).toBeGreaterThan(0);
  });

  it("decodes raw base64 + contentType", () => {
    const { contentType } = decodeImagePayload({ base64: PNG_1x1, contentType: "image/png" });
    expect(contentType).toBe("image/png");
  });

  it("rejects an unsupported type", () => {
    expect(() => decodeImagePayload({ base64: PNG_1x1, contentType: "image/gif" })).toThrow(
      /unsupported_image_type/,
    );
  });

  it("rejects an empty payload", () => {
    expect(() => decodeImagePayload({ base64: "", contentType: "image/png" })).toThrow(/empty_image/);
  });

  it("rejects an oversized payload", () => {
    const big = Buffer.alloc(MAX_ASSET_IMAGE_BYTES + 1).toString("base64");
    expect(() => decodeImagePayload({ base64: big, contentType: "image/png" })).toThrow(/image_too_large/);
  });
});

describe("isAssetKey", () => {
  it("accepts the four valid Vytal key shapes", () => {
    expect(isAssetKey("users/u1/avatar/abc.jpg")).toBe(true);
    expect(isAssetKey("orgs/o1/branding/logo-abc.png")).toBe(true);
    expect(isAssetKey("orgs/o1/members/m1/abc.webp")).toBe(true);
    expect(isAssetKey("orgs/o1/coaches/c1/abc.jpg")).toBe(true);
  });

  it("rejects traversal, schemes, leading slash and wrong shapes", () => {
    expect(isAssetKey("users/../etc/passwd.jpg")).toBe(false);
    expect(isAssetKey("/users/u1/avatar/abc.jpg")).toBe(false);
    expect(isAssetKey("s3://bucket/users/u1/avatar/abc.jpg")).toBe(false);
    expect(isAssetKey("orgs/o1/contracts/x.jpg")).toBe(false);
    expect(isAssetKey("users/u1/avatar/abc.gif")).toBe(false);
    expect(isAssetKey("random/key")).toBe(false);
  });
});

describe("assetToken / keyFromAssetToken", () => {
  const keys = [
    "users/u1/avatar/abc.jpg",
    "orgs/o1/branding/logo-abc.png",
    "orgs/o1/members/m1/abc.webp",
    "orgs/o1/coaches/c1/abc.jpg",
  ];

  it("round-trips every valid key shape", () => {
    for (const key of keys) {
      expect(keyFromAssetToken(assetToken(key))).toBe(key);
    }
  });

  it("assetUrl wraps the token under /api/asset/", () => {
    const url = assetUrl(keys[0]!);
    expect(url.startsWith("/api/asset/")).toBe(true);
    expect(keyFromAssetToken(url.slice("/api/asset/".length))).toBe(keys[0]);
  });

  it("rejects a tampered signature", () => {
    const token = assetToken(keys[0]!);
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(keyFromAssetToken(tampered)).toBeNull();
  });

  it("rejects a forged token for a malformed key", () => {
    // A valid-looking token whose embedded key is not an asset key never verifies.
    const forged = assetToken("orgs/o1/contracts/secret.jpg");
    expect(keyFromAssetToken(forged)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(keyFromAssetToken("")).toBeNull();
    expect(keyFromAssetToken("no-dot")).toBeNull();
    expect(keyFromAssetToken(".onlysig")).toBeNull();
  });
});
