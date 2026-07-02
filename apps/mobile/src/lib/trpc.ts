import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@vytal-fit/api";
import { getApiBaseUrl, getAuthToken } from "./auth-api";

/**
 * First-party tRPC client for the mobile app — the SAME public API the web
 * apps consume, authenticated with the Better Auth bearer token (OAuth/session
 * model). Partners use the `/v1` API-key gateway instead; first-party apps
 * (web cookie, mobile bearer) talk to `/trpc` directly. `AppRouter` is a
 * type-only import so no server code is bundled into the RN app.
 */
export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/trpc`,
      transformer: superjson,
      headers() {
        const token = getAuthToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
