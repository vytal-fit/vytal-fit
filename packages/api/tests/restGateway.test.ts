/**
 * Guards the shared REST route convention + API-key helpers that back both the
 * OpenAPI docs and the live `/v1` gateway. Pure (no DB): asserts the mapping
 * from tRPC procedures to clean REST paths, the matcher used by the gateway,
 * and key generation/hashing.
 */
import { describe, it, expect } from "vitest";
import {
  buildRouteTable,
  matchRoute,
  pathTemplate,
} from "../src/rest-routes";
import { extractApiKey, generateApiKey, hashApiKey } from "../src/api-keys";

describe("rest route table", () => {
  const table = buildRouteTable();
  const byPath = (m: string, p: string) =>
    table.find((r) => r.method === m && pathTemplate(r) === p);

  it("maps CRUD verbs to REST paths and never exposes tRPC paths", () => {
    expect(byPath("get", "/members")?.procPath).toBe("members.list");
    expect(byPath("post", "/members")?.procPath).toBe("members.create");
    expect(byPath("patch", "/members/{id}")?.procPath).toBe("members.update");
    expect(byPath("get", "/members/me")?.procPath).toBe("members.me");
    // Nested routers become nested resources.
    expect(byPath("get", "/subscriptions/plans")?.procPath).toBe("subscriptions.plans.list");
    for (const r of table) expect(pathTemplate(r).startsWith("/trpc")).toBe(false);
  });

  it("nests logical sub-resources for a restful surface (no /wod-results)", () => {
    expect(byPath("get", "/wods/results")?.procPath).toBe("wodResults.list");
    expect(byPath("get", "/classes/types")?.procPath).toBe("classTypes.list");
    expect(byPath("get", "/classes/templates")?.procPath).toBe("classTemplates.list");
    expect(byPath("get", "/members/groups")?.procPath).toBe("memberGroups.list");
    expect(table.some((r) => pathTemplate(r) === "/wod-results")).toBe(false);
    expect(table.some((r) => pathTemplate(r) === "/member-groups")).toBe(false);
  });

  it("matchRoute prefers the most specific route over a wildcard", () => {
    // /members/me must resolve to members.me, never members.byId with id="me".
    expect(matchRoute("GET", ["members", "me"])?.route.procPath).toBe("members.me");
    expect(matchRoute("GET", ["members", "abc123"])?.route.procPath).toBe("members.byId");
    // /classes/types beats /classes/{id}; a real id still hits byId.
    expect(matchRoute("GET", ["classes", "types"])?.route.procPath).toBe("classTypes.list");
    expect(matchRoute("GET", ["classes", "cl-1"])?.route.procPath).toBe("classes.byId");
  });

  it("excludes private resources (API-key management is first-party only)", () => {
    expect(table.some((r) => r.resource === "apiKeys")).toBe(false);
  });

  it("matchRoute resolves a method+path back to its procedure with params", () => {
    const hit = matchRoute("PATCH", ["members", "mem_123"]);
    expect(hit?.route.procPath).toBe("members.update");
    expect(hit?.params).toEqual({ id: "mem_123" });
    expect(matchRoute("DELETE", ["members"])).toBeNull(); // no delete at collection root
    expect(matchRoute("GET", ["nope", "nope"])).toBeNull();
  });
});

describe("api keys", () => {
  it("generates a vk_live_ key whose hash is stable and prefix/last4 line up", () => {
    const { key, prefix, last4, hash } = generateApiKey();
    expect(key.startsWith("vk_live_")).toBe(true);
    expect(prefix).toBe(key.slice(0, 12));
    expect(last4).toBe(key.slice(-4));
    expect(hash).toBe(hashApiKey(key));
    expect(hashApiKey(key)).toHaveLength(64); // sha-256 hex
  });

  it("extracts a key only from a well-formed Bearer header", () => {
    const h = (v: string) => new Headers({ authorization: v });
    expect(extractApiKey(h("Bearer vk_live_abc123"))).toBe("vk_live_abc123");
    expect(extractApiKey(h("Bearer not-a-key"))).toBeNull();
    expect(extractApiKey(new Headers())).toBeNull();
  });
});
