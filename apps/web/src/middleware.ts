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

// Member portal routes (athlete-facing)
const MEMBER_ROUTES = new Set([
  "console",
  "console/community",
  "console/workouts",
  "console/progress",
]);

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

// Vytal subdomains
const ADMIN_SUBDOMAINS = ["admin", "control", "pro"];
const MEMBER_SUBDOMAINS = ["my"];

function getSubdomain(hostname: string): string | null {
  let host = hostname.split(":")[0];
  // Strip www. prefix (www.pro.vytal.fit → pro.vytal.fit)
  if (host.startsWith("www.")) {
    host = host.slice(4);
  }
  // Check for vytal.fit subdomains
  if (host.endsWith(".vytal.fit")) {
    return host.replace(".vytal.fit", "");
  }
  // Check for vercel preview subdomains (ignore these)
  if (host.endsWith(".vercel.app")) return null;
  // localhost doesn't have subdomains in dev
  if (host === "localhost" || host.startsWith("localhost:")) return null;
  return null;
}

function isVytalDomain(hostname: string): boolean {
  const host = hostname.split(":")[0];
  return host === "vytal.fit"
    || host.endsWith(".vytal.fit")
    || host.endsWith(".vercel.app")
    || host === "localhost"
    || host.startsWith("localhost:");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const subdomain = getSubdomain(hostname);

  // ─── Subdomain Handling (admin.vytal.fit, console.vytal.fit) ───
  if (subdomain && ADMIN_SUBDOMAINS.includes(subdomain)) {
    // pro.vytal.fit / admin.vytal.fit → serve admin app
    // Root → redirect to /dashboard (auth guard in layout handles login redirect)
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (subdomain && MEMBER_SUBDOMAINS.includes(subdomain)) {
    // my.vytal.fit → serve member portal
    // Rewrite all paths to /console/...
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/console";
      return NextResponse.rewrite(url);
    }
    // /schedule → /console/schedule, /wod → /console/wod, etc.
    if (!pathname.startsWith("/console")) {
      const url = request.nextUrl.clone();
      url.pathname = `/console${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Handle www.* → redirect to non-www
  const rawHost = (request.headers.get("host") ?? "").split(":")[0];
  if (rawHost.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = rawHost.slice(4) + (request.headers.get("host")?.includes(":") ? ":" + request.headers.get("host")?.split(":")[1] : "");
    return NextResponse.redirect(url, 301);
  }

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
      if (MEMBER_ROUTES.has(firstSegment)) {
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

    if (MEMBER_ROUTES.has(firstSegment)) {
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
