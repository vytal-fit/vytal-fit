import { NextResponse } from "next/server";
import { PR_UNITS } from "@vytal-fit/db";
import { getRestCaller } from "@/lib/rest-caller";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

type Params = { id: string };

function normalizePrUnit(value: unknown): (typeof PR_UNITS)[number] | undefined {
  if (typeof value !== "string") return undefined;
  const raw = value.toLowerCase();
  if (raw === "lb") return "lbs";
  if (raw === "m") return "meters";
  if ((PR_UNITS as readonly string[]).includes(raw)) {
    return raw as (typeof PR_UNITS)[number];
  }
  return undefined;
}

export async function PATCH(
  request: Request,
  context: { params: Params },
): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const caller = await getRestCaller(request);
  const updated = await caller.personalRecords.update({
    id: context.params.id,
    data: {
      memberId: typeof body.memberId === "string" ? body.memberId : undefined,
      exerciseId: typeof body.exerciseId === "string" ? body.exerciseId : undefined,
      value: typeof body.value === "string" ? body.value : undefined,
      unit: normalizePrUnit(body.unit),
      achievedAt: body.achievedAt ? new Date(String(body.achievedAt)) : undefined,
      previousValue: typeof body.previousValue === "string" ? body.previousValue : undefined,
    },
  });
  return NextResponse.json(updated, { status: 200 });
}
