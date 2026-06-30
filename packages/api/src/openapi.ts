/**
 * OpenAPI 3.1 contract for the Vytal API — **generated from the tRPC router**.
 *
 * The served surface is tRPC over HTTP at `/api/trpc/{procedure}`. Rather than
 * hand-maintaining a spec that drifts, this walks `appRouter` and emits one
 * operation per procedure, with request schemas produced from each procedure's
 * Zod input via Zod 4's native `z.toJSONSchema`. New routers/procedures appear
 * in `/openapi.json` automatically.
 *
 * Conventions encoded:
 *   - Auth is a **session cookie** (browser) or **Bearer token** (mobile/server).
 *   - Every resource is **scoped to the caller's active organization**.
 *   - Queries are `GET /trpc/{path}?input=<json>`; mutations are
 *     `POST /trpc/{path}` with the JSON input as the body. Responses use the
 *     tRPC envelope `{ "result": { "data": ... } }`.
 *   - Errors share one shape: `{ "error": "<CODE>", "message": "<human>" }`.
 */
import { z } from "zod";
import { appRouter } from "./router";

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

  for (const [path, proc] of Object.entries(procedures)) {
    const def = (proc as { _def?: JsonObject })._def ?? {};
    const type = (def.type as "query" | "mutation") ?? "query";
    const ns = path.split(".")[0];
    tagSet.add(ns);

    const inputs = def.inputs as unknown[] | undefined;
    const inputZod = inputs && inputs.length ? inputs[inputs.length - 1] : undefined;
    let inputSchema: unknown = null;
    if (inputZod) {
      try {
        inputSchema = sanitizeSchema(
          z.toJSONSchema(inputZod as z.ZodType, { io: "input" }),
          path,
          sharedSchemas,
        );
      } catch {
        inputSchema = { type: "object" };
      }
    }

    const operation: JsonObject = {
      operationId: path,
      tags: [titleCase(ns)],
      summary: `${type === "query" ? "Query" : "Mutation"}: ${path}`,
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      responses: {
        "200": {
          description: "OK — tRPC envelope `{ result: { data } }`.",
          content: { "application/json": { schema: { type: "object" } } },
        },
        "400": ERROR_REF,
        "401": ERROR_REF,
        "403": ERROR_REF,
        "404": ERROR_REF,
      },
    };

    const httpPath = `/trpc/${path}`;
    if (type === "query") {
      if (inputSchema) {
        operation.parameters = [
          {
            name: "input",
            in: "query",
            required: false,
            description: "Procedure input, JSON-encoded.",
            schema: inputSchema,
          },
        ];
      }
      paths[httpPath] = { get: operation };
    } else {
      if (inputSchema) {
        operation.requestBody = {
          required: true,
          content: { "application/json": { schema: inputSchema } },
        };
      }
      paths[httpPath] = { post: operation };
    }
  }

  const tags = [...tagSet]
    .sort()
    .map((t) => ({ name: titleCase(t), description: `${titleCase(t)} procedures.` }));

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
        "This contract is **generated from the tRPC router**, so it always matches",
        "the deployed surface.",
        "",
        "## Authentication",
        "Sign in with `POST /api/auth/sign-in/email`. **Browser apps** receive a",
        "session cookie; send it with `credentials: \"include\"`. **Mobile /",
        "server** clients read the token from the `set-auth-token` response header",
        "and send it as `Authorization: Bearer <token>`.",
        "",
        "## Conventions",
        "- **Org scope** is implicit (from the session), never a body field.",
        "- **Queries** are `GET /trpc/{path}?input=<json>`; **mutations** are",
        "  `POST /trpc/{path}` with the JSON input as the body.",
        "- **Responses** use the tRPC envelope `{ \"result\": { \"data\": ... } }`.",
        "- **Errors** return `{ \"error\": \"CODE\", \"message\": \"...\" }`.",
      ].join("\n"),
      contact: { name: "Vytal", url: "https://vytal.fit" },
    },
    servers: [
      { url: "https://api.vytal.fit/api", description: "Production" },
      { url: "http://localhost:3001/api", description: "Local development" },
    ],
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    tags,
    paths,
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Session cookie set by POST /api/auth/sign-in/email. Browser clients send it with credentials.",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description:
            "Session token from the `set-auth-token` header on sign-in; send as `Authorization: Bearer <token>`.",
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
