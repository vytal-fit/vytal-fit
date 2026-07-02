/**
 * OpenAPI 3.1 contract for the Vytal API — **generated from the tRPC router**.
 *
 * The public surface is a clean REST gateway at `/v1/*` (see `rest-routes.ts`,
 * which both this spec and the live gateway consume, so docs never drift from
 * what works). Rather than hand-maintaining a spec, this walks `appRouter` and
 * emits one operation per REST route, with request schemas produced from each
 * procedure's Zod input via Zod 4's native `z.toJSONSchema`. New
 * routers/procedures appear in `/openapi.json` automatically.
 *
 * Conventions encoded:
 *   - Auth is an **organization API key**: `Authorization: Bearer vk_live_…`.
 *   - Every resource is **scoped to the key's organization**.
 *   - Lists return `{ "items": [ ... ] }`; single resources return bare.
 *   - Errors share one shape: `{ "error": "<CODE>", "message": "<human>" }`.
 */
import { z } from "zod";
import { appRouter } from "./router";
import { buildRouteTable, pathTemplate } from "./rest-routes";

const ERROR_REF = { $ref: "#/components/responses/Error" } as const;

type JsonObject = Record<string, unknown>;

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Deep-clone a JSON-Schema produced by Zod and make it OpenAPI-3.1 safe:
 *  - drop the per-schema `$schema` dialect marker
 *  - hoist any `$defs` into the shared component bucket (prefixed by the
 *    procedure path to avoid collisions) and rewrite local `$ref`s to point at
 *    `#/components/schemas/...`.
 */
function sanitizeSchema(input: unknown, prefix: string, shared: JsonObject): unknown {
  const defsKey = `${prefix.replace(/[^a-zA-Z0-9]/g, "_")}__`;

  function walk(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const obj = node as JsonObject;
      const out: JsonObject = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === "$schema") continue;
        if (k === "$ref" && typeof v === "string" && v.startsWith("#/$defs/")) {
          out.$ref = `#/components/schemas/${defsKey}${v.slice("#/$defs/".length)}`;
          continue;
        }
        if (k === "$defs" && v && typeof v === "object") {
          for (const [defName, defSchema] of Object.entries(v as JsonObject)) {
            shared[`${defsKey}${defName}`] = walk(defSchema);
          }
          continue;
        }
        out[k] = walk(v);
      }
      return out;
    }
    return node;
  }

  return walk(input);
}

function buildSpec() {
  const procedures = (appRouter as { _def: { procedures: Record<string, unknown> } })._def
    .procedures;
  const sharedSchemas: JsonObject = {};
  const paths: JsonObject = {};
  const tagSet = new Set<string>();

  for (const route of buildRouteTable()) {
    const { procPath, type, method, pathParams } = route;
    const proc = procedures[procPath];
    const def = (proc as { _def?: JsonObject })._def ?? {};
    tagSet.add(route.resource);

    const inputs = def.inputs as unknown[] | undefined;
    const inputZod = inputs && inputs.length ? inputs[inputs.length - 1] : undefined;
    let inputSchema: unknown = null;
    if (inputZod) {
      try {
        inputSchema = sanitizeSchema(
          z.toJSONSchema(inputZod as z.ZodType, { io: "input" }),
          procPath,
          sharedSchemas,
        );
      } catch {
        inputSchema = { type: "object" };
      }
    }

    const httpPath = pathTemplate(route);
    const verb = procPath.split(".").pop();

    const operation: JsonObject = {
      operationId: procPath,
      tags: [titleCase(route.resource)],
      summary: `${titleCase(route.resource)}: ${verb}`,
      security: [{ apiKeyAuth: [] }, { bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        "200": { description: "Success.", content: { "application/json": { schema: { type: "object" } } } },
        "400": ERROR_REF,
        "401": ERROR_REF,
        "403": ERROR_REF,
        "404": ERROR_REF,
      },
    };

    const parameters: JsonObject[] = pathParams.map((p) => ({
      name: p,
      in: "path",
      required: true,
      schema: { type: "string" },
    }));

    if (method === "get") {
      const schemaObj = inputSchema as { properties?: Record<string, JsonObject>; required?: string[] } | null;
      if (schemaObj?.properties) {
        for (const [name, prop] of Object.entries(schemaObj.properties)) {
          if (pathParams.includes(name)) continue;
          parameters.push({
            name,
            in: "query",
            required: (schemaObj.required ?? []).includes(name),
            schema: prop,
          });
        }
      }
    } else if (inputSchema) {
      operation.requestBody = {
        required: true,
        content: { "application/json": { schema: inputSchema } },
      };
    }
    if (parameters.length) operation.parameters = parameters;

    const item = (paths[httpPath] as JsonObject) ?? {};
    item[method] = operation;
    paths[httpPath] = item;
  }

  const tags = [...tagSet]
    .sort()
    .map((t) => ({ name: titleCase(t), description: `${titleCase(t)} endpoints.` }));

  return {
    openapi: "3.1.0",
    info: {
      title: "Vytal API",
      version: "0.1.0",
      summary: "The operating system for fitness businesses, as an API.",
      description: [
        "The Vytal API powers bookings, memberships, payments, training results",
        "and personal records for gyms, CrossFit boxes and studios. Everything is",
        "scoped to the caller's **active organization** (the gym) and isolated",
        "per tenant.",
        "",
        "The reference below is generated directly from the live backend, so it",
        "always matches what's deployed.",
        "",
        "## Authentication",
        "Every request authenticates with an **organization API key**:",
        "`Authorization: Bearer vk_live_…`. Keys are created and revoked from",
        "**Settings → API Keys** in the Vytal app (never via the API itself, the",
        "same way Stripe issues keys). Each key is scoped to one organization, so",
        "the org is always implicit and metered per key.",
        "",
        "Vytal's own web and mobile apps are first-party and use session auth",
        "against the internal tRPC surface: third-party integrations must use a",
        "key.",
        "",
        "## Conventions",
        "- **Org scope** is implicit (from the session), never a body field.",
        "- **Lists** return `{ \"items\": [ ... ] }`; single resources return bare.",
        "- **Errors** return `{ \"error\": \"CODE\", \"message\": \"...\" }` with the",
        "  matching HTTP status (401, 403, 404, 400).",
      ].join("\n"),
      contact: { name: "Vytal", url: "https://vytal.fit" },
    },
    servers: [
      { url: "https://api.vytal.fit/v1", description: "Production" },
      { url: "http://localhost:3001/v1", description: "Local development" },
    ],
    security: [{ apiKeyAuth: [] }, { bearerAuth: [] }, { cookieAuth: [] }],
    tags,
    paths,
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
          description:
            "**Partners / server-to-server.** Send your organization API key as `Authorization: Bearer vk_live_…` (Stripe-style). Create and manage keys in Settings → API Keys; every request is scoped and metered to that key's organization.",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "**First-party session (OAuth / Better Auth).** Vytal's own apps authenticate with a session token via `Authorization: Bearer <token>` — the web apps use tRPC with this session, native/mobile and internal tooling can call `/v1` REST with the same bearer. Not issued to third parties (partners use an API key).",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "First-party session **cookie** (browser). Equivalent to the bearer session for same-site web apps. External integrations must use an API key.",
        },
      },
      responses: {
        Error: {
          description: "Error — `{ error: CODE, message }` with the matching HTTP status.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              examples: {
                unauthorized: { value: { error: "UNAUTHORIZED", message: "Sign in required." } },
                forbidden: { value: { error: "FORBIDDEN", message: "Not allowed for this organization." } },
                notFound: { value: { error: "NOT_FOUND", message: "Resource not found." } },
                badRequest: { value: { error: "BAD_REQUEST", message: "Invalid input." } },
              },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string", description: "Stable machine-readable code (e.g. NOT_FOUND)." },
            message: { type: "string", description: "Human-readable explanation." },
          },
        },
        ...sharedSchemas,
      },
    },
  };
}

export const openApiSpec = buildSpec();
