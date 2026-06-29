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
  if (!memberId) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "memberId is required." },
      { status: 400 },
    );
  }
  const items = await caller.bookings.listByMember({ memberId });
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." },
      { status: 503 },
    );
  }

  let body: { classId?: string; memberId?: string };
  try {
    body = (await request.json()) as { classId?: string; memberId?: string };
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.classId || !body.memberId) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "classId and memberId are required." },
      { status: 400 },
    );
  }

  const caller = await getRestCaller(request);
  const created = await caller.bookings.book({
    classId: body.classId,
    memberId: body.memberId,
  });
  return NextResponse.json(created, { status: 201 });
}
