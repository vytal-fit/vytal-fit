# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web/e2e/smoke.spec.ts >> Smoke tests >> app loads without console errors
- Location: apps/web/e2e/smoke.spec.ts:4:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboard", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Smoke tests", () => {
  4  |   test("app loads without console errors", async ({ page }) => {
  5  |     const errors: string[] = [];
  6  |     page.on("console", (msg) => {
  7  |       if (msg.type() === "error") errors.push(msg.text());
  8  |     });
  9  | 
  10 |     await page.addInitScript(() => {
  11 |       localStorage.setItem("vytal-right-sidebar-open", "false");
  12 |     });
> 13 |     await page.goto("/dashboard");
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  14 |     await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  15 | 
  16 |     const realErrors = errors.filter(
  17 |       (e) =>
  18 |         !e.includes("[HMR]") &&
  19 |         !e.includes("hydration") &&
  20 |         !e.includes("NEXT_REDIRECT") &&
  21 |         !e.includes("recoverableError") &&
  22 |         !e.includes("favicon")
  23 |     );
  24 |     expect(realErrors).toHaveLength(0);
  25 |   });
  26 | 
  27 |   test("404 page returns for unknown routes", async ({ page }) => {
  28 |     const response = await page.goto("/this-route-does-not-exist");
  29 |     expect(response?.status()).toBe(404);
  30 |   });
  31 | });
  32 | 
```