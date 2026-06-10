# Backend wiring — apps/web ⇄ packages/*

Status of the tRPC/Better Auth/Drizzle plumbing in the web app.

## What is wired

| Piece | File | Notes |
|---|---|---|
| tRPC route handler | `apps/web/src/app/api/trpc/[trpc]/route.ts` | `fetchRequestHandler` + shared `appRouter`. Builds the API `Context` per request: lazy DB (`getDb()`) + Better Auth session mapped to `{ user, activeOrganizationId }`. |
| Better Auth routes | `apps/web/src/app/api/auth/[...all]/route.ts` | `toNextJsHandler` over a lazy handler — serves sign-in/up, sessions, org switching. |
| Auth server singleton | `apps/web/src/lib/auth-server.ts` | `getAuth()` builds the Better Auth instance on first use from `createAuth` + `getDb()`. `isBackendConfigured()` gates on env. |
| Typed client | `apps/web/src/lib/trpc.ts` | `createTRPCReact<AppRouter>` + `httpBatchLink` with the `superjson` transformer (matches the server). |
| Provider | `apps/web/src/components/trpc-provider.tsx` | QueryClientProvider + `trpc.Provider`, mounted in `src/app/layout.tsx` around all existing providers. |
| Env template | `.env.example` (repo root) | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. |

### Laziness guarantee

No module reads env vars or opens a DB connection at import time. `next build`
succeeds with **zero** env vars set. At runtime without env, API routes answer
cleanly: tRPC calls get a `SERVICE_UNAVAILABLE` TRPCError, auth routes get a
JSON 503 — never a crash.

### Auth/isolation rules

All enforcement lives in `packages/api` (`protectedProcedure`, `orgProcedure`).
The route handler only *supplies* the session; it never grants or filters
anything itself.

## What is NOT wired (yet)

- **Every page still reads/writes localStorage.** No screen, store, or
  component has been migrated to tRPC hooks. The provider and routes are
  inert until pages start calling `trpc.<router>.<proc>.useQuery()`.
- No PostgreSQL instance is provisioned; no migrations have been run against
  a real database.
- No env vars are set on Vercel.
- The mobile app (Expo) is not connected to this API.

## Migration path

1. **Provision PostgreSQL** (e.g. Neon via Vercel Marketplace) and set
   `DATABASE_URL` locally.
2. **Run migrations:** `cd packages/db && npx drizzle-kit push` (or apply the
   generated SQL migrations).
3. **Set env on Vercel:** `DATABASE_URL`, `BETTER_AUTH_SECRET`
   (`openssl rand -base64 32`), `BETTER_AUTH_URL` (the deployment URL).
4. **Migrate page-by-page:** replace each localStorage data-store read/write
   with the matching tRPC hook (`useQuery`/`useMutation` + invalidation).
   Start with low-risk read-only screens; keep localStorage as the source of
   truth for a page until its full CRUD surface is on tRPC.
5. **Swap the auth mock:** point `AuthProvider` at Better Auth's client
   (`better-auth/react`) once real sessions exist, including active-org
   switching (`organization` plugin).
