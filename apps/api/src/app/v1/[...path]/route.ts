/**
 * The public REST gateway (`/v1/*`).
 *
 * One catch-all handler serves every documented REST path by matching the
 * request against the shared route table (`matchRoute`) and dispatching to the
 * corresponding tRPC procedure. Because the docs (OpenAPI) and this gateway both
 * derive from `packages/api/src/rest-routes.ts`, the documented surface and the
 * working surface can never drift.
 *
 * Auth is **API-key only** (`Authorization: Bearer vk_live_…`). First-party apps
 * use tRPC directly; unpaid/session callers get 401 here.
 */
import { NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { matchRoute, type RestRoute } from "@vytal-fit/api";
import { getApiGatewayCaller } from "@/lib/rest-caller";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

type Caller = Record<string, unknown>;

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status });
}

/** Resolve a dotted procedure path (e.g. "subscriptions.plans.list") on the caller. */
function resolveProcedure(caller: Caller, procPath: string): ((input?: unknown) => Promise<unknown>) | null {
  let node: unknown = caller;
  for (const part of procPath.split(".")) {
    if (!node || typeof node !== "object") return null;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "function" ? (node as (input?: unknown) => Promise<unknown>) : null;
}

/** Coerce a query-string value: JSON where it parses (numbers, bools, arrays), else the raw string. */
function coerce(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const STATUS_BY_CODE: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

async function handle(request: Request, segments: string[]): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return json({ error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." }, 503);
  }

  const match = matchRoute(request.method, segments);
  if (!match) {
    return json({ error: "NOT_FOUND", message: `No route for ${request.method} /${segments.join("/")}.` }, 404);
  }
  const { route, params } = match as { route: RestRoute; params: Record<string, string> };

  const caller = await getApiGatewayCaller(request);
  if (!caller) {
    return json(
      {
        error: "UNAUTHORIZED",
        message: "Provide a valid API key: Authorization: Bearer vk_live_…",
      },
      401,
    );
  }

  // Assemble the procedure input from path params + query (GET) or body (write).
  let input: Record<string, unknown> = { ...params };
  if (route.method === "get") {
    const url = new URL(request.url);
    for (const [k, v] of url.searchParams.entries()) input[k] = coerce(v);
  } else {
    try {
      const text = await request.text();
      if (text) {
        const body = JSON.parse(text) as unknown;
        if (body && typeof body === "object") input = { ...(body as object), ...params };
      }
    } catch {
      return json({ error: "BAD_REQUEST", message: "Invalid JSON body." }, 400);
    }
  }

  const proc = resolveProcedure(caller as Caller, route.procPath);
  if (!proc) {
    return json({ error: "NOT_FOUND", message: "Procedure not found." }, 404);
  }

  try {
    const hasInput = Object.keys(input).length > 0;
    const result = await proc(hasInput ? input : undefined);
    // Lists come back as bare arrays; wrap them in the documented `{ items }` envelope.
    if (Array.isArray(result)) return json({ items: result }, 200);
    return json(result ?? {}, route.method === "post" ? 201 : 200);
  } catch (err) {
    if (err instanceof TRPCError) {
      return json(
        { error: err.code, message: err.message },
        STATUS_BY_CODE[err.code] ?? 500,
      );
    }
    return json({ error: "INTERNAL_SERVER_ERROR", message: "Unexpected error." }, 500);
  }
}

type Ctx = { params: Promise<{ path?: string[] }> };
const seg = async (ctx: Ctx) => (await ctx.params).path ?? [];

export async function GET(request: Request, ctx: Ctx) {
  return handle(request, await seg(ctx));
}
export async function POST(request: Request, ctx: Ctx) {
  return handle(request, await seg(ctx));
}
export async function PATCH(request: Request, ctx: Ctx) {
  return handle(request, await seg(ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(request, await seg(ctx));
}
