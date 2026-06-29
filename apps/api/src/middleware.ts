import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CORS_ALLOWED_ORIGINS = new Set([
  "https://vytal.fit",
  "https://www.vytal.fit",
  "https://pro.vytal.fit",
  "https://www.pro.vytal.fit",
  "https://my.vytal.fit",
  "https://www.my.vytal.fit",
  "https://api.vytal.fit",
  "https://www.api.vytal.fit",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3003",
  "http://127.0.0.1:3004",
]);

function getCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const normalized = origin.replace(/\/+$/, "");
  if (CORS_ALLOWED_ORIGINS.has(normalized)) return normalized;

  try {
    const url = new URL(normalized);
    if (url.hostname.endsWith(".vercel.app")) return normalized;
  } catch {
    return null;
  }

  return null;
}

function withCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = getCorsOrigin(request);
  if (!origin) return response;

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ?? "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.append("Vary", "Origin");
  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return withCorsHeaders(new NextResponse(null, { status: 204 }), request);
  }

  return withCorsHeaders(NextResponse.next(), request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
