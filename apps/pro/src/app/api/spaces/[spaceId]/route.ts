/**
 * REST wrapper for a single space.
 */
import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type Params = {
  spaceId: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
): Promise<NextResponse> {
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

  const { spaceId } = await context.params;
  const space = await getAuth().api.getFullOrganization({
    headers: request.headers,
    query: { organizationId: spaceId },
  });

  if (!space) {
    return NextResponse.json(
      {
        error: "NOT_FOUND",
        message: "Space not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(space, { status: 200 });
}
