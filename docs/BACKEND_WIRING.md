# Backend wiring — apps/web ⇄ packages/*

Status of the tRPC/Better Auth/Drizzle plumbing in the web app.

## What is wired

| Piece | File | Notes |
|---|---|---|
| tRPC route handler | `apps/web/src/app/api/trpc/[trpc]/route.ts` | `fetchRequestHandler` + shared `appRouter`. Builds the API `Context` per request: lazy DB (`getDb()`) + Better Auth session mapped to `{ user, activeOrganizationId }`. The public host rewrites `/trpc` to this handler. |
| Better Auth routes | `apps/web/src/app/api/auth/[...all]/route.ts` | `toNextJsHandler` over a lazy handler — serves sign-in/up, sessions, org switching. The public host rewrites `/auth/*` to this handler. |
| Auth server singleton | `apps/web/src/lib/auth-server.ts` | `getAuth()` builds the Better Auth instance on first use from `createAuth` + `getDb()`. `isBackendConfigured()` gates on env. |
| Typed client | `apps/web/src/lib/trpc.ts` | `createTRPCReact<AppRouter>` + `httpBatchLink` with the `superjson` transformer (matches the server). |
| Developer docs | `apps/web/src/app/developer/page.tsx` | `api.vytal.fit/` rewrites here. Human-readable bridge page that points to ReadMe on `docs.vytal.fit` and links the raw OpenAPI payload. |
| OpenAPI spec | `apps/web/src/app/openapi/route.ts` | `GET /openapi` returns the machine-readable spec used by the docs page and downstream tooling. |
| Provider | `apps/web/src/components/trpc-provider.tsx` | QueryClientProvider + `trpc.Provider`, mounted in `src/app/layout.tsx` around all existing providers. |
| Env template | `.env.example` (repo root) | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`. |
| Health endpoint | `apps/web/src/app/api/health/route.ts` | `GET /health` → `{ status, backend: configured\|unconfigured, db: ok\|error\|skipped, version }`. Cheap `SELECT 1` via the lazy client when env is present; never crashes without env; no secrets in output. |
| Seed (library) | `packages/db/src/seed.ts` | `seedDatabase(db, { auth })` — idempotent (upsert/skip on conflict). Seeds the 3 demo orgs, demo users with real hashed passwords (via `auth.api.signUpEmail`), org memberships, and the full `@vytal-fit/shared` mock dataset into org-1. Importable as `@vytal-fit/db/seed`. |
| Seed (CLI) | `packages/db/scripts/seed.ts` | `npm run db:seed -w @vytal-fit/db`. Loads env from the shell or `.env.local`/`.env` (repo root and apps/web), prints a per-table summary. Safe to re-run. |
| Migrations (CLI) | `packages/db/drizzle.config.ts` | `npm run db:migrate -w @vytal-fit/db` applies the committed `packages/db/migrations/` folder (`drizzle-kit migrate`). The config auto-loads `.env.local` too. |

### Laziness guarantee

No module reads env vars or opens a DB connection at import time. `next build`
succeeds with **zero** env vars set. At runtime without env, API routes answer
cleanly: tRPC calls get a `SERVICE_UNAVAILABLE` TRPCError, auth routes get a
JSON 503 — never a crash.

### Auth/isolation rules

All enforcement lives in `packages/api` (`protectedProcedure`, `orgProcedure`).
The route handler only *supplies* the session; it never grants or filters
anything itself.

## Go-live — exact command sequence

Run from the repo root. Prerequisite: the repo is linked to the Vercel
project (`npx vercel link`).

```bash
# 1. Provision PostgreSQL — Neon via the Vercel Marketplace (sets DATABASE_URL
#    on the project automatically) …
npx vercel integration add neon
#    … OR bring your own Postgres and set DATABASE_URL manually:
npx vercel env add DATABASE_URL production

# 2. Auth secret + origins
openssl rand -base64 32 | npx vercel env add BETTER_AUTH_SECRET production
npx vercel env add BETTER_AUTH_URL production   # e.g. https://api.vytal.fit
npx vercel env add NEXT_PUBLIC_APP_URL production   # e.g. https://pro.vytal.fit
npx vercel env add NEXT_PUBLIC_API_URL production   # e.g. https://api.vytal.fit
# Optional: add extra trusted origins if the app moves across domains.
# npx vercel env add BETTER_AUTH_TRUSTED_ORIGINS production   # e.g. https://vytal.fit,https://my.vytal.fit

# 3. Pull the env locally (repo root — db scripts read .env.local from here)
npx vercel env pull .env.local

# 4. Apply the committed migrations (packages/db/migrations/)
#    `drizzle-kit migrate` applies the generated SQL journal — do NOT use
#    `push` against a production database.
npm run db:migrate -w @vytal-fit/db

# 5. Seed demo orgs, users (real hashed passwords), and the org-1 dataset.
#    Idempotent — safe to re-run; a second run inserts zero rows.
npm run db:seed -w @vytal-fit/db

# 6. Redeploy so the runtime picks up the env, then verify
npx vercel deploy --prod --yes
curl https://<your-deployment>/health
# → {"status":"ok","backend":"configured","db":"ok","version":"0.1.0"}
```

For local development, the same works against any `DATABASE_URL` in
`.env.local` (root or `apps/web/`); then `curl http://localhost:3001/health`.

### Origin contract

The API is its own origin. In production that means `api.vytal.fit` serves
`/auth/*` and `/trpc`, while `pro.vytal.fit` serves the user-facing
web app. The browser and mobile clients must use `NEXT_PUBLIC_API_URL`
(web) or `EXPO_PUBLIC_API_URL` (mobile) instead of guessing same-origin.
`BETTER_AUTH_URL` must match the API host, and `NEXT_PUBLIC_APP_URL` must match
the web host for email callbacks and redirects.

### Demo credentials (seeded)

Password for all accounts: **`VytalDemo2026!`** (defined as `DEMO_PASSWORD`
in `packages/db/src/seed.ts`).

| Email | Memberships |
|---|---|
| `jose@vytal.fit` | owner of org-1 (CrossFit Aveiro), athlete of org-2 (Yoga Flow Porto), coach of org-3 (Iron Temple) — mirrors `mockCurrentUser` |
| `coach@vytal.fit` | coach in org-1 |
| `athlete@vytal.fit` | athlete in org-1 |

Org-1 also receives the full demo dataset: 4 coaches, 4 locations, 8 class
types, 10 classes, 5 bookings, 25 gym members, 8 plans, 26 subscriptions,
12 leads, 3 WODs, 10 personal records, 15 notifications, plus the global
100-exercise library.

## What is NOT wired (yet)

- **Every page still reads/writes localStorage.** No screen, store, or
  component has been migrated to tRPC hooks. The provider and routes are
  inert until pages start calling `trpc.<router>.<proc>.useQuery()`.
- The mobile app (Expo) is not connected to this API.

## Migration path

1. **Go live** with the command sequence above (Postgres + env + migrations
   + seed).
2. **Migrate page-by-page:** replace each localStorage data-store read/write
   with the matching tRPC hook (`useQuery`/`useMutation` + invalidation).
   Start with low-risk read-only screens; keep localStorage as the source of
   truth for a page until its full CRUD surface is on tRPC.
3. **Swap the auth mock:** point `AuthProvider` at Better Auth's client
   (`better-auth/react`) once real sessions exist, including active-org
   switching (`organization` plugin).
