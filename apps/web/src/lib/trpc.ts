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
import { getApiUrl } from "@/lib/api-url";

export const trpc = createTRPCReact<AppRouter>();

/** Build a tRPC client instance (one per app, created in TRPCProvider). */
export function createClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getApiUrl("/api/trpc"),
        transformer: superjson,
        fetch: (url, init) =>
          fetch(url, {
            ...init,
            credentials: "include",
          }),
      }),
    ],
  });
}
