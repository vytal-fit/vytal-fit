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

// Member console routes (athlete-facing portal)
const CONSOLE_ROUTES = new Set(["console"]);

// Public org page routes (not admin)
const PUBLIC_ORG_ROUTES = new Set([
  "schedule", "pricing", "shop", "team", "contact",
]);

// Custom domain → org slug mapping
// In production this would come from a database lookup
const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  "crossfit-aveiro.pt": "crossfit-aveiro",
  "crossfitaveiro.pt": "crossfit-aveiro",
  "yogaflowporto.pt": "yoga-flow-porto",
  "irontemple.pt": "iron-temple",
};

// The main Vytal domains (not custom)
const VYTAL_DOMAINS = new Set([
  "vytal.fit",
  "vytal-fit-iota.vercel.app",
  "localhost",
  "localhost:3000",
]);

function isVytalDomain(hostname: string): boolean {
  // Strip port for comparison
  const host = hostname.split(":")[0];
  return VYTAL_DOMAINS.has(hostname) || VYTAL_DOMAINS.has(host) || hostname.endsWith(".vercel.app");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  // ─── Custom Domain Handling ───
  // If the request is on a custom domain (not vytal.fit), route to that org's public pages
  if (!isVytalDomain(hostname)) {
    const orgSlug = CUSTOM_DOMAIN_MAP[hostname] ?? CUSTOM_DOMAIN_MAP[hostname.split(":")[0]];

    if (orgSlug) {
      const url = request.nextUrl.clone();
      // Root → org homepage
      if (pathname === "/" || pathname === "") {
        url.pathname = `/org/${orgSlug}`;
        return NextResponse.rewrite(url);
      }
      // Sub-pages → org sub-pages
      const firstSegment = pathname.split("/")[1];
      if (PUBLIC_ORG_ROUTES.has(firstSegment)) {
        url.pathname = `/org/${orgSlug}${pathname}`;
        return NextResponse.rewrite(url);
      }
      // Console routes on custom domain → rewrite directly to /console/...
      if (CONSOLE_ROUTES.has(firstSegment)) {
        url.pathname = pathname;
        return NextResponse.rewrite(url);
      }
      // Admin routes on custom domain → redirect to vytal.fit/@slug/admin-route
      if (ADMIN_ROUTES.has(firstSegment)) {
        url.hostname = "vytal.fit";
        url.port = "";
        url.pathname = `/@${orgSlug}${pathname}`;
        return NextResponse.redirect(url);
      }
      // Fallback: treat as org sub-page
      url.pathname = `/org/${orgSlug}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // ─── @slug Routing (vytal.fit/@orgSlug/...) ───
  if (pathname.startsWith("/@")) {
    const rest = pathname.slice(2);
    const slashIndex = rest.indexOf("/");

    if (slashIndex === -1) {
      // /@orgSlug → public org page
      const url = request.nextUrl.clone();
      url.pathname = `/org/${rest}`;
      return NextResponse.rewrite(url);
    }

    const orgSlug = rest.slice(0, slashIndex);
    const subpath = rest.slice(slashIndex);
    const firstSegment = subpath.split("/")[1];

    if (ADMIN_ROUTES.has(firstSegment)) {
      // /@org/dashboard → /dashboard
      const url = request.nextUrl.clone();
      url.pathname = subpath;
      return NextResponse.rewrite(url);
    }

    if (CONSOLE_ROUTES.has(firstSegment)) {
      // /@org/console → /console (member portal, rewrite without org prefix)
      const url = request.nextUrl.clone();
      url.pathname = subpath;
      return NextResponse.rewrite(url);
    }

    // Public org sub-pages: /@org/schedule → /org/orgSlug/schedule
    const url = request.nextUrl.clone();
    url.pathname = `/org/${rest}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
