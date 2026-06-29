import { createTrpcRouteHandler } from "@/lib/trpc-route";

const handler = createTrpcRouteHandler("/trpc");

export const GET = handler;
export const POST = handler;
