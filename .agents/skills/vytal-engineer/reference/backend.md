# Backend reference — db, api, auth

The backend lives in `packages/`. Web consumes it through the typed tRPC client,
so the contract you define here is the contract everywhere.

## Layer map

| Package | Owns | Key files |
|---|---|---|
| `@vytal-fit/db` | Drizzle schema, migrations, PostgreSQL client | `src/schema.ts`, `src/client.ts` |
| `@vytal-fit/api` | tRPC routers, context, procedures | `src/trpc.ts`, `src/router.ts`, `src/routers/*` |
| `@vytal-fit/auth` | Better Auth instance, RBAC, orgs | `src/*` |
| `@vytal-fit/shared` | Types/constants used by web (+ future mobile) | `src/*` |

## tRPC procedures — pick the right base

- `publicProcedure` — no auth. Almost nothing should use this.
- `protectedProcedure` — authenticated user, no org requirement. Use only for
  account/onboarding-level operations.
- `orgProcedure` — authenticated **and** has `activeOrganizationId`. **This is
  the default for every app-domain resource** (members, classes, subscriptions,
  WODs, PRs, invoices, leads…).

### Writing a procedure

```ts
export const membersRouter = router({
  list: orgProcedure
    .input(z.object({
      status: z.enum(MEMBER_STATUSES).optional(),
      cursor: z.string().nullish(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // ALWAYS scope by org. No exceptions.
      return db.query.members.findMany({
        where: and(
          eq(members.organizationId, ctx.activeOrganizationId),
          input.status ? eq(members.status, input.status) : undefined,
        ),
        limit: input.limit,
      });
    }),
});
```

Rules:
- Validate **every** input with Zod. Reuse schemas from `@vytal-fit/shared`.
- Every read and write is filtered by `ctx.activeOrganizationId`. For a write,
  re-fetch-and-check ownership before mutating — never trust an id from the
  client. Return `NOT_FOUND` (not `FORBIDDEN`) to avoid leaking existence.
- Throw `TRPCError` with the right code; never leak raw DB errors to the client.
- Register new routers in `src/router.ts` (the `appRouter` object).

## Database — Drizzle + PostgreSQL

- Schema is `packages/db/src/schema.ts`. Every tenant-owned table carries
  `organizationId` (FK → Better Auth `organization`).
- **`schema.ts` is the SINGLE SOURCE OF TRUTH.** The flow:
  `packages/db/src/schema.ts` (Drizzle tables + indexes) →
  `drizzle-kit generate` emits versioned SQL → migrations apply them.
- **Schema-change workflow:** edit `schema.ts` → run
  `cd packages/db && npx drizzle-kit generate` → commit the migration →
  verify with `npx drizzle-kit push`.
- Add an index for every column you filter or sort on in a hot path
  (`organizationId`, `status`, `createdAt`…). See `scaling.md`.
- Tenant isolation is enforced **in application code** (the `where` clause).
  A missing org filter is a vulnerability, not a bug.

## Auth & multi-tenancy

- Better Auth owns sessions, RBAC, orgs, and invites (`@vytal-fit/auth`).
- Role hierarchy: Owner → Admin → Coach → Personal Trainer → Athlete.
  Gate management-only procedures by role; enforce on the server.
- `activeOrganizationId` comes from the session and populates the tRPC context.

## Portuguese fiscal compliance

- SAF-T, ATCUD, QR fiscal are mandatory for all invoicing features.
- Invoice numbering series must be configurable per document type.
- All billing changes must consider Stripe, MBWay, SEPA, and Multibanco.

## Before you call backend work done

- `npm run type-check` + `npm run lint` green.
- New/changed procedures have tests covering the happy path, unauthorized path,
  and **cross-tenant isolation**.
- Migration applies cleanly and is backward-safe.
