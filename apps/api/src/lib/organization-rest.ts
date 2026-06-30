import { NextResponse } from "next/server";
import { getAuth, isBackendConfigured } from "@/lib/auth-server";

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

  const organizations = await getAuth().api.listOrganizations({
    headers: request.headers,
  });

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

  const organization = await getAuth().api.getFullOrganization({
    headers: request.headers,
    query: { organizationId },
  });

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
