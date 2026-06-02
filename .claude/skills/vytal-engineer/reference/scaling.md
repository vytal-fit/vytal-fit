# Scaling & 10-year maintainability reference

The bar: this codebase must serve individual CrossFit boxes today and many
boxes/gyms as multi-tenant SaaS later, and stay readable and changeable for a
decade.

## Maintainability

- **One pattern per concern.** Before adding code, find how the codebase already
  does it and match it. Divergent patterns drive long-term rot.
- **Respect module boundaries.** `db` ← `api` ← apps; shared types in `shared`.
  UI never imports the DB client; apps never reach around the tRPC contract.
- **Thin routers, pure cores.** Keep IO at the edges and domain logic in pure,
  unit-testable functions.
- **Types are the contract.** No `any` across boundaries; let inference flow
  from Zod schema → tRPC → client.
- **Dependency hygiene.** Don't add a library for something the stack already
  does. Every dep is a 10-year liability.

## Performance & data scale

- **No N+1.** Fetch related data with joins / `with` relations or a single
  batched query — never a query inside a `.map()` over rows.
- **Index every hot filter/sort.** `organizationId`, `status`, `createdAt`,
  and any column used in a `where`/`orderBy` on a list endpoint.
- **Paginate all lists.** Use keyset/cursor pagination, not `OFFSET`.
- **Select only needed columns** on wide tables.
- **Push work to the DB** (filter, sort, aggregate, count) instead of loading
  rows into Node and looping.
- **Bound everything unbounded:** batch sizes, fan-out, retries.

## Multi-tenancy at scale

- Every new table is org-scoped; every new query carries the org filter.
- Don't assume tenant size. A 20-member box and a 500-member gym must both work.

## Real-time considerations

- WebSocket connections for coachboard, leaderboard, and timers.
- Timer sync across coach phone, athlete app, and TV display.
- Keep WebSocket handlers thin; persist state changes to DB, broadcast diffs.

## Quick pre-merge scaling check

- [ ] No query inside a loop; related data fetched in one batch.
- [ ] New filter/sort columns are indexed; lists are cursor-paginated and capped.
- [ ] Org filter present (correctness + the leading index column).
- [ ] Heavy work is async/idempotent, not inline.
- [ ] No new dependency that the stack already covers.
- [ ] Matches an existing pattern; boundaries respected; no `any`.
