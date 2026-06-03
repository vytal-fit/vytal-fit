# Testing reference

Test strategy: a pyramid, cheapest signal first. Write as many tests at each
tier as that tier is genuinely good at catching — no quota, no theatre.

| Tier | Tests | Tool | Runtime |
|---|---|---|---|
| Type-check + lint | compile errors, banned patterns | `tsc --noEmit`, ESLint | <30s, blocking |
| Unit | pure functions, one in → one out, no IO | Vitest | <5s |
| Integration | modules together on real-but-disposable DB | Vitest | <60s |
| API / tRPC | procedures with a fabricated session ctx; tenant isolation, role gating, error shapes | Vitest | — |
| E2E | full user flows, cross-browser, responsive, a11y, i18n, theme | Playwright | `apps/web/e2e/` |

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

## Playwright E2E tests

Tests live in `apps/web/e2e/*.spec.ts`. Config at `apps/web/playwright.config.ts`.

```bash
npm run test:e2e          # all browsers (chromium, firefox, webkit + mobile)
npm run test:e2e:ui       # interactive UI mode
cd apps/web
npx playwright test --project=chromium  # single browser
npx playwright test --debug             # step-through debugger
npx playwright test --headed            # watch the browser
```

### Test structure

- `e2e/global.setup.ts` — authenticates once, saves session to `.auth/user.json`
- `e2e/fixtures/test.ts` — custom fixtures (persona switching, test helpers)
- `e2e/smoke.spec.ts` — fast sanity: app boots, no console errors, 404 works
- `e2e/home.spec.ts` — home page rendering + responsive
- `e2e/a11y.spec.ts` — accessibility baseline (landmarks, headings, lang, alt text)
- `e2e/i18n.spec.ts` — PT/EN/ES locale rendering, no leaked keys
- `e2e/theme.spec.ts` — dark + light mode rendering

### Projects (browsers)

Playwright runs 5 projects: chromium, firefox, webkit, mobile-chrome (Pixel 7),
mobile-safari (iPhone 14). All depend on the `setup` project for auth state.

### Writing new E2E tests

1. Import from `@playwright/test` (or `./fixtures/test` for custom fixtures).
2. Use `page.getByRole()`, `page.getByLabel()`, `page.getByText()` — prefer
   accessible locators over CSS selectors.
3. Group related tests in a `test.describe()` block.
4. Add `test.slow()` for tests that need extra timeout.
5. For auth-dependent tests, the storage state is loaded automatically.

### CI

E2E runs in a separate CI job after lint/type-check/unit pass. On failure,
the HTML report is uploaded as an artifact for debugging.

## Done bar for tests

- New behaviour is covered at the cheapest tier that can catch its failures.
- Every tenant-scoped procedure has a cross-tenant isolation test.
- `npm test` is green; no test is skipped/`.only` left behind.
- For UI, automated tests don't replace the `vytal-qa` browser pass — do both.
