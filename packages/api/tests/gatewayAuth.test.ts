import { describe, expect, it } from "vitest";
import { extractApiKey } from "../src/api-keys";

/**
 * The public REST gateway (/v1) branches auth on the Authorization header:
 *   • `Bearer vk_live_…` → partner API-key path (resolveApiKeySession)
 *   • anything else       → first-party session path (Better Auth getSession)
 * That branch hinges on extractApiKey ONLY recognizing vk_ keys, so a session
 * bearer token is NOT mistaken for an API key and correctly falls through to
 * the session path. These tests pin that contract.
 */
function headers(auth?: string): Headers {
  const h = new Headers();
  if (auth) h.set("authorization", auth);
  return h;
}

describe("public REST gateway auth branching (extractApiKey)", () => {
  it("recognizes a partner API key (Bearer vk_live_…)", () => {
    expect(extractApiKey(headers("Bearer vk_live_a1b2c3d4e5f6"))).toBe("vk_live_a1b2c3d4e5f6");
  });

  it("also matches the vk_ prefix generally (e.g. vk_test_)", () => {
    expect(extractApiKey(headers("Bearer vk_test_deadbeef"))).toBe("vk_test_deadbeef");
  });

  it("does NOT treat a first-party session bearer as an API key (falls through to session)", () => {
    // A Better Auth session/JWT bearer has no vk_ prefix → extractApiKey returns
    // null → the gateway uses the session path instead of the key path.
    expect(extractApiKey(headers("Bearer eyJhbGciOiJIUzI1NiJ9.session.token"))).toBeNull();
  });

  it("returns null when no Authorization header is present", () => {
    expect(extractApiKey(headers())).toBeNull();
  });

  it("returns null for a malformed Authorization header", () => {
    expect(extractApiKey(headers("Basic dXNlcjpwYXNz"))).toBeNull();
    expect(extractApiKey(headers("vk_live_nobearerprefix"))).toBeNull();
  });
});
