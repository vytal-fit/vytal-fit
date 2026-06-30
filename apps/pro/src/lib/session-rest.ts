import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

interface UpdateSessionBody {
  activeOrganizationId?: string;
}

function authErrorResponse(error: unknown): NextResponse {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 401;
  const message =
    error instanceof Error && error.message ? error.message : "Unauthorized";

  return NextResponse.json(
    {
      error: status === 401 ? "UNAUTHORIZED" : "AUTH_ERROR",
      message,
    },
    { status },
  );
}

export async function updateCurrentSession(request: Request): Promise<NextResponse> {
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
      { error: "BAD_REQUEST", message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const organizationId = body.activeOrganizationId;
  if (!organizationId || typeof organizationId !== "string") {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "activeOrganizationId is required." },
      { status: 400 },
    );
  }

  let session;
  try {
    await getAuth().api.setActiveOrganization({
      body: { organizationId },
      headers: request.headers,
    });

    session = await getAuth().api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
  const activeOrganizationId = session?.session.activeOrganizationId ?? null;

  return NextResponse.json({ activeOrganizationId }, { status: 200 });
}
