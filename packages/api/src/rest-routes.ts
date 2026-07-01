/**
 * The single source of truth that maps tRPC procedures to clean REST routes.
 *
 * Both the OpenAPI generator (`openapi.ts`) and the REST gateway (the api app's
 * catch-all handler) consume this, so the documented paths and the paths that
 * actually work are guaranteed to be identical. No tRPC path is ever exposed.
 *
 * Convention (verb = last segment of the procedure path; nested routers become
 * nested resources, e.g. `subscriptions.plans.list` → `GET /subscriptions/plans`):
 *   list                → GET    /resource
 *   me                  → GET    /resource/me
 *   byId | get          → GET    /resource/{id}
 *   create              → POST   /resource
 *   update              → PATCH  /resource/{id}
 *   delete              → DELETE /resource/{id}
 *   <other> (query)     → GET    /resource/<other>
 *   <other> (mutation)  → POST   /resource/<other>
 */
import { appRouter } from "./router";

export type HttpMethod = "get" | "post" | "patch" | "delete";

export interface RestRoute {
  /** tRPC procedure path, e.g. "subscriptions.plans.list". */
  procPath: string;
  type: "query" | "mutation";
  method: HttpMethod;
  /** Path template segments, e.g. ["members", "{id}"]. */
  segments: string[];
  /** Names of `{param}` segments, e.g. ["id"]. */
  pathParams: string[];
  /** Top-level resource (for tagging). */
  resource: string;
}

export function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Router prefixes (everything before the verb) that map to a nested REST
 * resource instead of their own kebab name, so the surface reads hierarchically:
 * `wodResults.list` → `GET /wods/results`, not `GET /wod-results`. The gateway's
 * matcher prefers the most specific route, so these never clash with the
 * parent's `/{id}` routes (e.g. `/classes/types` beats `/classes/{id}`).
 */
const PATH_OVERRIDES: Record<string, string[]> = {
  wodResults: ["wods", "results"],
  workoutFeedback: ["wods", "feedback"],
  classTypes: ["classes", "types"],
  classTemplates: ["classes", "templates"],
  memberGroups: ["members", "groups"],
};

function baseRoute(
  procPath: string,
  type: "query" | "mutation",
): { method: HttpMethod; segments: string[]; pathParams: string[] } {
  const parts = procPath.split(".");
  const verb = parts.pop() as string;
  const prefix = parts.join(".");
  const resourceSegments = PATH_OVERRIDES[prefix] ?? parts.map(kebab);
  const q = type === "query";
  switch (verb) {
    case "list":
      return { method: "get", segments: resourceSegments, pathParams: [] };
    case "me":
      return { method: "get", segments: [...resourceSegments, "me"], pathParams: [] };
    case "byId":
    case "get":
      return { method: "get", segments: [...resourceSegments, "{id}"], pathParams: ["id"] };
    case "create":
      return { method: "post", segments: resourceSegments, pathParams: [] };
    case "update":
      return { method: "patch", segments: [...resourceSegments, "{id}"], pathParams: ["id"] };
    case "delete":
      return { method: "delete", segments: [...resourceSegments, "{id}"], pathParams: ["id"] };
    default:
      return {
        method: q ? "get" : "post",
        segments: [...resourceSegments, kebab(verb)],
        pathParams: [],
      };
  }
}

/**
 * Resources excluded from the public REST surface (and its docs). API-key
 * lifecycle is first-party only: you can't mint or revoke keys *with* a key.
 */
const PRIVATE_RESOURCES = new Set(["apiKeys", "auditLog", "webhooks", "backups"]);

let cached: RestRoute[] | null = null;

/** Build (and cache) the full REST route table from the live router. */
export function buildRouteTable(): RestRoute[] {
  if (cached) return cached;
  const procedures = (appRouter as { _def: { procedures: Record<string, unknown> } })._def
    .procedures;
  const used = new Set<string>();
  const table: RestRoute[] = [];

  for (const [procPath, proc] of Object.entries(procedures)) {
    if (PRIVATE_RESOURCES.has(procPath.split(".")[0])) continue;
    const type = ((proc as { _def?: { type?: string } })._def?.type as "query" | "mutation") ?? "query";
    const base = baseRoute(procPath, type);
    let segments = base.segments;
    let key = `${base.method} ${segments.join("/")}`;
    // Disambiguate the rare exact collision (e.g. a router with both byId+get).
    if (used.has(key)) {
      segments = [...segments, kebab(procPath.split(".").pop() as string)];
      key = `${base.method} ${segments.join("/")}`;
    }
    used.add(key);
    table.push({
      procPath,
      type,
      method: base.method,
      segments,
      pathParams: base.pathParams,
      resource: procPath.split(".")[0],
    });
  }

  cached = table;
  return table;
}

export function pathTemplate(route: RestRoute): string {
  return `/${route.segments.join("/")}`;
}

/**
 * Match an incoming request (method + path segments) to a route. When several
 * routes match, the **most specific** wins (fewest `{param}` segments) — so a
 * static route like `GET /members/me` or `GET /classes/types` always beats the
 * parent's `GET /members/{id}` / `GET /classes/{id}`, regardless of table order.
 */
export function matchRoute(
  method: string,
  segments: string[],
): { route: RestRoute; params: Record<string, string> } | null {
  const m = method.toLowerCase();
  let best: { route: RestRoute; params: Record<string, string> } | null = null;
  for (const route of buildRouteTable()) {
    if (route.method !== m) continue;
    if (route.segments.length !== segments.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < segments.length; i++) {
      const tpl = route.segments[i];
      if (tpl.startsWith("{") && tpl.endsWith("}")) {
        params[tpl.slice(1, -1)] = decodeURIComponent(segments[i]);
      } else if (tpl !== segments[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (!best || route.pathParams.length < best.route.pathParams.length) {
      best = { route, params };
    }
  }
  return best;
}
