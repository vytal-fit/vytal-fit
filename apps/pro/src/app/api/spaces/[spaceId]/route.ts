import type { NextRequest } from "next/server";
import { getOrganization } from "@/lib/organization-rest";

export const dynamic = "force-dynamic";

type Params = {
  spaceId: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  const { spaceId } = await context.params;
  return getOrganization(request, spaceId);
}
