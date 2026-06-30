import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

interface UpdateSessionBody {
  activeOrganizationId?: string;
  activeSpaceId?: string;
}

interface UpdateCurrentSessionOptions {
  includeDeprecatedFields?: boolean;
}

export async function updateCurrentSession(
  request: Request,
  options: UpdateCurrentSessionOptions = {},
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

  const organizationId = body.activeOrganizationId ?? body.activeSpaceId;
  if (!organizationId || typeof organizationId !== "string") {
    return NextResponse.json(
      {
        error: "BAD_REQUEST",
        message: "activeOrganizationId is required.",
      },
      { status: 400 },
    );
  }

  await getAuth().api.setActiveOrganization({
    body: { organizationId },
    headers: request.headers,
  });

  const session = await getAuth().api.getSession({
    headers: request.headers,
  });
  const activeOrganizationId = session?.session.activeOrganizationId ?? null;

  return NextResponse.json(
    options.includeDeprecatedFields
      ? { activeOrganizationId, activeSpaceId: activeOrganizationId }
      : { activeOrganizationId },
    { status: 200 },
  );
}
