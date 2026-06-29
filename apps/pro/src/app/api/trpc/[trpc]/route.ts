import { createTrpcRouteHandler } from "@/lib/trpc-route";

const handler = createTrpcRouteHandler("/api/trpc");

export const GET = handler;
export const POST = handler;
