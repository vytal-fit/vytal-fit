import { NextResponse, type NextRequest } from "next/server";
import { getRestCaller } from "@/lib/rest-caller";
import { isBackendConfigured } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

type Params = { bookingId: string };

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> },
): Promise<NextResponse> {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "Backend unavailable." },
      { status: 503 },
    );
  }

  const { bookingId } = await context.params;
  const caller = await getRestCaller(request);
  const cancelled = await caller.bookings.cancel({ id: bookingId });
  return NextResponse.json(cancelled, { status: 200 });
}
