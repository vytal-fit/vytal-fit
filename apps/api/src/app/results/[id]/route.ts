import { NextResponse, type NextRequest } from "next/server";
import { getRestCaller } from "@/lib/rest-caller";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Params> },
): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const caller = await getRestCaller(request);
  const { id } = await context.params;
  const updated = await caller.wodResults.update({
    id,
    data: {
      wodId: typeof body.wodId === "string" ? body.wodId : undefined,
      memberId: typeof body.memberId === "string" ? body.memberId : undefined,
      classId: typeof body.classId === "string" ? body.classId : undefined,
      score: typeof body.score === "string" ? body.score : undefined,
      scoreType: typeof body.scoreType === "string" ? body.scoreType as never : undefined,
      scale: typeof body.scale === "string" ? body.scale as never : undefined,
      isPR: typeof body.isPR === "boolean" ? body.isPR : undefined,
      rpe: typeof body.rpe === "number" ? body.rpe : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    },
  });
  return NextResponse.json(updated, { status: 200 });
}
