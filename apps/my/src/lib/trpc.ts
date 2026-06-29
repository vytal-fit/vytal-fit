/**
 * Typed tRPC client for the member app.
 *
 * Reuses the API origin helper so `my.vytal.fit` talks to `api.vytal.fit`
 * directly, with credentials included for session-bound requests.
 */
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@vytal-fit/api";
import { getApiUrl } from "@/lib/api-url";

export const trpc = createTRPCReact<AppRouter>();

export function createClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getApiUrl("/trpc"),
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
