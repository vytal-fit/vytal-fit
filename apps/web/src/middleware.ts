import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /@orgSlug to /org/orgSlug
  if (pathname.startsWith("/@")) {
    const slug = pathname.slice(2); // Remove "/@"
    const url = request.nextUrl.clone();
    url.pathname = `/org/${slug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
