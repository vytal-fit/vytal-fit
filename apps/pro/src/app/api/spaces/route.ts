/**
 * REST wrapper for the authenticated user's spaces.
 */
import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: "SERVICE_UNAVAILABLE",
        message:
          "Auth backend is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.",
      },
      { status: 503 },
    );
  }

  const spaces = await getAuth().api.listOrganizations({
    headers: request.headers,
  });

  return NextResponse.json(spaces, { status: 200 });
}
