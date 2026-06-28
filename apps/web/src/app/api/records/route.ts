import { NextResponse } from "next/server";
import { PR_UNITS } from "@vytal-fit/db";
import { getRestCaller } from "@/lib/rest-caller";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

function normalizePrUnit(value: unknown): (typeof PR_UNITS)[number] {
  const raw = typeof value === "string" ? value.toLowerCase() : "kg";
  if (raw === "lb") return "lbs";
  if (raw === "m") return "meters";
  if ((PR_UNITS as readonly string[]).includes(raw)) {
    return raw as (typeof PR_UNITS)[number];
  }
  return "kg";
}

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
  const exerciseId = url.searchParams.get("exerciseId") ?? undefined;
  const result = await caller.personalRecords.list({ memberId, exerciseId });
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
  const created = await caller.personalRecords.create({
    memberId: String(body.memberId ?? ""),
    exerciseId: String(body.exerciseId ?? ""),
    value: String(body.value ?? ""),
    unit: normalizePrUnit(body.unit),
    achievedAt: body.achievedAt ? new Date(String(body.achievedAt)) : undefined,
    previousValue: typeof body.previousValue === "string" ? body.previousValue : undefined,
  });
  return NextResponse.json(created, { status: 201 });
}
