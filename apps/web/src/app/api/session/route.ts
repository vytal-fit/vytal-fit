/**
 * Session REST wrapper.
 *
 * Exposes a small REST-friendly surface over Better Auth's session mutation
 * endpoints so clients don't need to talk to `/organization/set-active`
 * directly.
 */
import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

interface UpdateSessionBody {
  activeSpaceId?: string;
}

export async function PATCH(request: Request): Promise<NextResponse> {
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

  let body: UpdateSessionBody;
  try {
    body = (await request.json()) as UpdateSessionBody;
  } catch {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  if (!body.activeSpaceId || typeof body.activeSpaceId !== "string") {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: "activeSpaceId is required.",
      },
      { status: 400 },
    );
  }

  await getAuth().api.setActiveOrganization({
    body: { organizationId: body.activeSpaceId },
    headers: request.headers,
  });

  const session = await getAuth().api.getSession({
    headers: request.headers,
  });

  return NextResponse.json(
    {
      activeSpaceId: session?.session.activeOrganizationId ?? null,
    },
    { status: 200 },
  );
}
