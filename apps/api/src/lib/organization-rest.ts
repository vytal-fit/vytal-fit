import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

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

export async function listOrganizations(request: Request): Promise<NextResponse> {
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

  let organizations;
  try {
    organizations = await getAuth().api.listOrganizations({
      headers: request.headers,
    });
  } catch (error) {
    return authErrorResponse(error);
  }

  return NextResponse.json(organizations, { status: 200 });
}

export async function getOrganization(
  request: Request,
  organizationId: string,
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

  let organization;
  try {
    organization = await getAuth().api.getFullOrganization({
      headers: request.headers,
      query: { organizationId },
    });
  } catch (error) {
    return authErrorResponse(error);
  }

  if (!organization) {
    return NextResponse.json(
      {
        error: "NOT_FOUND",
        message: "Organization not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(organization, { status: 200 });
}
