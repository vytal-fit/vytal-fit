import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin routes that exist under /(app)/
const ADMIN_ROUTES = new Set([
  "dashboard", "members", "classes", "wods", "crm", "staff",
  "class-types", "locations", "exercises", "store", "plans",
  "dropins", "media", "equipment", "import", "financials",
  "analytics", "ai", "reports", "community", "tasks", "inbox",
  "notifications", "messages", "communications", "automations",
  "screen", "support", "marketing", "settings", "integrations",
  "changelog", "help", "profile", "setup", "onboarding",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /@orgSlug and /@orgSlug/...
  if (pathname.startsWith("/@")) {
    const rest = pathname.slice(2); // Remove "/@"
    const slashIndex = rest.indexOf("/");

    if (slashIndex === -1) {
      // /@orgSlug (no sub-path) → public org page
      const url = request.nextUrl.clone();
      url.pathname = `/org/${rest}`;
      return NextResponse.rewrite(url);
    }

    // /@orgSlug/subpath → rewrite to admin route if it's a known route
    const subpath = rest.slice(slashIndex); // e.g. /dashboard, /members/123
    const firstSegment = subpath.split("/")[1];

    if (ADMIN_ROUTES.has(firstSegment)) {
      // Rewrite /@org/dashboard → /dashboard (handled by (app) layout)
      const url = request.nextUrl.clone();
      url.pathname = subpath;
      return NextResponse.rewrite(url);
    }

    // Unknown sub-route → try as org sub-page
    const url = request.nextUrl.clone();
    url.pathname = `/org/${rest}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
