/**
 * Contract guard for the **generated** OpenAPI spec (built from the tRPC
 * router): every `$ref` must resolve, every operation declares responses + a
 * declared tag, and the spec must cover the whole router (incl. newer routers
 * like payments/expenses) so it can't silently drift.
 */
import { describe, it, expect } from "vitest";
import { openApiSpec } from "../src/openapi";

function collectRefs(node: unknown, acc: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((n) => collectRefs(n, acc));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === "$ref" && typeof v === "string") acc.push(v);
      else collectRefs(v, acc);
    }
  }
}

function resolveRef(ref: string): unknown {
  const parts = ref.replace(/^#\//, "").split("/");
  let cur: unknown = openApiSpec;
  for (const p of parts) {
    if (cur && typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

type Operation = { responses?: Record<string, unknown>; tags?: string[] };
const paths = openApiSpec.paths as unknown as Record<string, Record<string, Operation>>;

describe("openApiSpec", () => {
  it("is OpenAPI 3.1 with core metadata and a security scheme", () => {
    expect(openApiSpec.openapi).toBe("3.1.0");
    expect(openApiSpec.info.title).toBe("Vytal API");
    expect(openApiSpec.components.securitySchemes.cookieAuth).toBeTruthy();
  });

  it("covers the whole router, incl. newer procedures", () => {
    const opCount = Object.values(paths).reduce((n, m) => n + Object.keys(m).length, 0);
    expect(opCount).toBeGreaterThan(100);
    // Generated from the router — newer routers must show up automatically.
    for (const p of [
      "/trpc/members.list",
      "/trpc/payments.stats",
      "/trpc/expenses.list",
      "/trpc/dashboard.charts",
    ]) {
      expect(paths[p], `missing generated path: ${p}`).toBeDefined();
    }
    expect((openApiSpec.components.schemas as Record<string, unknown>).Error).toBeDefined();
  });

  it("resolves every $ref to a defined component", () => {
    const refs: string[] = [];
    collectRefs(openApiSpec, refs);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(resolveRef(ref), `unresolved $ref: ${ref}`).toBeDefined();
    }
  });

  it("declares responses + a known tag on every operation", () => {
    const declaredTags = new Set<string>(openApiSpec.tags.map((t) => t.name));
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, op] of Object.entries(methods)) {
        const where = `${method.toUpperCase()} ${path}`;
        expect(Object.keys(op.responses ?? {}).length, `${where} has no responses`).toBeGreaterThan(0);
        expect((op.tags ?? []).length, `${where} has no tag`).toBeGreaterThan(0);
        for (const tag of op.tags ?? []) {
          expect(declaredTags.has(tag), `${where} uses undeclared tag "${tag}"`).toBe(true);
        }
      }
    }
  });
});
