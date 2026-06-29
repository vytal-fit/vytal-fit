import { NextResponse } from "next/server";
import { openApiSpec } from "@vytal-fit/api";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(openApiSpec, {
    headers: {
      "cache-control": "public, max-age=3600",
    },
  });
}
