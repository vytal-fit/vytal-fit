# Backend wiring — apps/api + apps/pro + apps/my ⇄ packages/*

Status of the tRPC/Better Auth/Drizzle plumbing across the split API and web apps.

## What is wired

| Piece | File | Notes |
|---|---|---|
| API tRPC route handler | `apps/api/src/app/trpc/[trpc]/route.ts` | `fetchRequestHandler` + shared `appRouter`. Builds the API `Context` per request: lazy DB (`getDb()`) + Better Auth session mapped to `{ user, activeOrganizationId }`. |
| API Better Auth routes | `apps/api/src/app/auth/[...all]/route.ts` | `toNextJsHandler` over a lazy handler. Serves sign-in/up, sign-out, session reads, and Better Auth organization endpoints from `api.vytal.fit/auth/*`. |
| Pro compatibility routes | `apps/pro/src/app/auth/[...all]/route.ts`, `apps/pro/src/app/trpc/[trpc]/route.ts` | Local/dev and legacy aliases only. Production clients should use `NEXT_PUBLIC_API_URL=https://api.vytal.fit`. |
| Canonical REST resources | `apps/api/src/app/organizations/`, `apps/api/src/app/me/session/` | Resource-oriented wrappers around the same auth/org logic. Canonical paths are `/organizations`, `/organizations/{organizationId}`, and `/me/session`. |
| Deprecated REST aliases | `apps/api/src/app/spaces/`, `apps/api/src/app/session/` | Kept for compatibility only. New clients must not use `/spaces` or `/session`. |
| Typed clients | `apps/pro/src/lib/trpc.ts`, `apps/my/src/lib/trpc.ts` | `createTRPCReact<AppRouter>` + `httpBatchLink` with the `superjson` transformer (matches the server). |
| Developer docs | `apps/api/src/app/developer/page.tsx` | `api.vytal.fit/` redirects to `/openapi.json`; human developer guides sync to ReadMe from `apps/api/readme`. |
| OpenAPI spec | `apps/api/src/app/openapi.json/route.ts` | `GET /openapi.json` returns the machine-readable spec used by downstream tooling. |
| Provider | `apps/pro/src/components/trpc-provider.tsx` | QueryClientProvider + `trpc.Provider`, mounted in `src/app/layout.tsx` around all existing providers. |
| Env template | `.env.example` (repo root) | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`. |
| Health endpoint | `apps/api/src/app/health/route.ts` | `GET /health` -> `{ status, backend: configured\|unconfigured, db: ok\|error\|skipped, version }`. Cheap `SELECT 1` via the lazy client when env is present; never crashes without env; no secrets in output. |
| Seed (library) | `packages/db/src/seed.ts` | `seedDatabase(db, { auth })` — idempotent (upsert/skip on conflict). Seeds the 3 demo orgs, demo users with real hashed passwords (via `auth.api.signUpEmail`), org memberships, and the full `@vytal-fit/shared` mock dataset into org-1. Importable as `@vytal-fit/db/seed`. |
| Seed (CLI) | `packages/db/scripts/seed.ts` | `npm run db:seed -w @vytal-fit/db`. Loads env from the shell or `.env.local`/`.env` (repo root and app env files), prints a per-table summary. Safe to re-run. |
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

Run from the repo root. Prerequisite: each Vercel project is connected to the
same GitHub repository with its root directory set to the matching app:
`apps/landing`, `apps/pro`, `apps/my`, or `apps/api`. When using `vercel env`
locally, link or select the project you are updating first.

```bash
# 1. Provision PostgreSQL — Neon via the Vercel Marketplace or bring your own
#    Postgres. DATABASE_URL and related Postgres vars belong on the api project.
npx vercel link --project api
npx vercel env add DATABASE_URL production

# 2. Auth secret + origins
openssl rand -base64 32 | npx vercel env add BETTER_AUTH_SECRET production
npx vercel env add BETTER_AUTH_URL production        # api project: https://api.vytal.fit
npx vercel env add NEXT_PUBLIC_APP_URL production    # api/pro project: https://pro.vytal.fit
# Optional: add extra trusted origins if the app moves across domains.
# npx vercel env add BETTER_AUTH_TRUSTED_ORIGINS production   # api project: https://vytal.fit,https://pro.vytal.fit,https://my.vytal.fit

# 2b. Link client projects before adding client-side public API vars.
npx vercel link --project pro
npx vercel env add NEXT_PUBLIC_API_URL production    # https://api.vytal.fit
npx vercel link --project my
npx vercel env add NEXT_PUBLIC_API_URL production    # https://api.vytal.fit

# 3. Pull the api env locally (repo root — db scripts read .env.local from here)
npx vercel link --project api
npx vercel env pull .env.local

# 4. Apply the committed migrations (packages/db/migrations/)
#    `drizzle-kit migrate` applies the generated SQL journal — do NOT use
#    `push` against a production database.
npm run db:migrate -w @vytal-fit/db

# 5. Seed demo orgs, users (real hashed passwords), and the org-1 dataset.
#    Idempotent — safe to re-run; a second run inserts zero rows.
npm run db:seed -w @vytal-fit/db

# 6. Redeploy api/pro/my/landing so runtimes pick up env, then verify
curl https://api.vytal.fit/health
# → {"status":"ok","backend":"configured","db":"ok","version":"0.1.0"}
```

For local development, the same works against any `DATABASE_URL` in
`.env.local` (root or `apps/api/`); then `curl http://localhost:3004/health`.

### Origin contract

The API is its own origin. In production that means `api.vytal.fit` serves
`/auth/*`, `/trpc`, `/health`, `/me/session`, `/organizations`, `/bookings`,
`/records`, `/results`, and `/openapi.json` directly, while `pro.vytal.fit`
serves the staff/backoffice app and `my.vytal.fit` serves the member portal.
`/session` and `/spaces` remain deprecated compatibility aliases only. The
browser and mobile clients must
use `NEXT_PUBLIC_API_URL` (web) or `EXPO_PUBLIC_API_URL` (mobile) instead of
guessing same-origin. `BETTER_AUTH_URL` must match the API host, and
`NEXT_PUBLIC_APP_URL` must match the web host for email callbacks and
redirects.

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

- Some `pro` and `my` pages still read/write localStorage or mock data. Core
  resource wiring exists, but the remaining prototype pages still need
  page-by-page migration to tRPC/REST.
- The mobile app (Expo) has API host wiring but still needs full auth/session
  parity and remaining feature wiring.

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
