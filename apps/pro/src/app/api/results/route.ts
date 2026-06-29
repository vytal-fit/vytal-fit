import { NextResponse } from "next/server";
import { getRestCaller } from "@/lib/rest-caller";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." },
      { status: 503 },
    );
  }

  const caller = await getRestCaller(request);
  const url = new URL(request.url);
  const memberId = url.searchParams.get("memberId") ?? undefined;
  const wodId = url.searchParams.get("wodId") ?? undefined;
  const date = url.searchParams.get("date") ?? undefined;
  const result = await caller.wodResults.list({ memberId, wodId, date });
  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const caller = await getRestCaller(request);
  const created = await caller.wodResults.create({
    wodId: String(body.wodId ?? ""),
    memberId: String(body.memberId ?? ""),
    classId: typeof body.classId === "string" ? body.classId : undefined,
    score: String(body.score ?? ""),
    scoreType: String(body.scoreType ?? "time") as never,
    scale: String(body.scale ?? "rx") as never,
    isPR: Boolean(body.isPR),
    rpe: typeof body.rpe === "number" ? body.rpe : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });
  return NextResponse.json(created, { status: 201 });
}
