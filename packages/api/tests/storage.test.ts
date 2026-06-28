/**
 * Object-store contract tests against the in-memory provider, focused on the
 * getKey() confinement that backs the public asset route.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { objectStore } from "../src/lib/storage";

beforeAll(() => {
  process.env.OBJECT_STORE = "memory";
});

describe("objectStore (memory)", () => {
  it("round-trips bytes by ref", async () => {
    const store = objectStore();
    const { ref } = await store.put("orgs/o1/members/m1/a.jpg", Buffer.from("hello"), "image/jpeg");
    expect(ref.startsWith("mem://")).toBe(true);
    expect((await store.get(ref)).toString()).toBe("hello");
  });

  it("resolves by logical key within its allowed prefix", async () => {
    const store = objectStore();
    const key = "orgs/o1/coaches/c1/b.png";
    await store.put(key, Buffer.from("coach"), "image/png");
    const bytes = await store.getKey(key, "orgs/o1/coaches/c1/");
    expect(bytes.toString()).toBe("coach");
  });

  it("refuses a key outside the allowed prefix", async () => {
    const store = objectStore();
    await expect(store.getKey("orgs/o2/branding/x.png", "orgs/o1/branding/")).rejects.toThrow(
      /allowed namespace/,
    );
  });

  it("refuses traversal and scheme keys", async () => {
    const store = objectStore();
    await expect(store.getKey("orgs/o1/../o2/x.png", "orgs/o1/")).rejects.toThrow(/allowed namespace/);
    await expect(store.getKey("s3://b/orgs/o1/x.png", "orgs/o1/")).rejects.toThrow(/allowed namespace/);
  });
});
