/**
 * Typed tRPC client for the web app.
 *
 * `trpc` exposes fully-typed React Query hooks for every procedure on the
 * shared `AppRouter` (e.g. `trpc.members.list.useQuery()`). The superjson
 * transformer matches the server (packages/api/src/trpc.ts) — in tRPC 11 the
 * transformer is configured on the link, not on the client.
 */
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@vytal-fit/api";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl(): string {
  // Browser: relative URL hits the same origin.
  if (typeof window !== "undefined") return "";
  // SSR on Vercel.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // SSR locally.
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/** Build a tRPC client instance (one per app, created in TRPCProvider). */
export function createClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}
