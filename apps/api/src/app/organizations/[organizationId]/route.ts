import type { NextRequest } from "next/server";
import { getOrganization } from "@/lib/organization-rest";

export const dynamic = "force-dynamic";

type Params = {
  organizationId: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  const { organizationId } = await context.params;
  return getOrganization(request, organizationId);
}
