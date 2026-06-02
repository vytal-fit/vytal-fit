# Testing reference

Test strategy: a pyramid, cheapest signal first. Write as many tests at each
tier as that tier is genuinely good at catching — no quota, no theatre.

| Tier | Tests | Tool | Runtime |
|---|---|---|---|
| Type-check + lint | compile errors, banned patterns | `tsc --noEmit`, ESLint | <30s, blocking |
| Unit | pure functions, one in → one out, no IO | Vitest | <5s |
| Integration | modules together on real-but-disposable DB | Vitest | <60s |
| API / tRPC | procedures with a fabricated session ctx; tenant isolation, role gating, error shapes | Vitest | — |
| E2E | full flows | Playwright | planned, not wired — use `vytal-qa` for now |

## Where tests live

`packages/<pkg>/tests/*.test.ts`, one Vitest project per package
(`vitest.workspace.ts`). Run from repo root:

```bash
npm test            # once
npm run test:watch  # watch
npm run test:coverage
```

## What each change must add

- **Pure function changed/added** → unit test: happy path + edge cases.
- **tRPC procedure changed/added** → API test covering:
  1. happy path with a valid org context,
  2. unauthorized (no user / no org) → correct `TRPCError` code,
  3. **cross-tenant isolation** — a user in org A cannot read or mutate org B's
     row (this test is mandatory for every tenant-scoped procedure),
  4. invalid input rejected by Zod,
  5. role gating where the procedure is restricted.
- **Bug fix** → a regression test that fails before the fix and passes after.
- **Schema change** → verify migration applies cleanly; rebuild from scratch.

## Done bar for tests

- New behaviour is covered at the cheapest tier that can catch its failures.
- Every tenant-scoped procedure has a cross-tenant isolation test.
- `npm test` is green; no test is skipped/`.only` left behind.
- For UI, automated tests don't replace the `vytal-qa` browser pass — do both.
