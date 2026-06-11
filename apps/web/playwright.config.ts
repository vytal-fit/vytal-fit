import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// CI runs a trimmed browser matrix (chromium + mobile-chrome) so every push
// gets a verdict in ~10 minutes. The full 5-browser matrix runs locally and
// on demand via FULL_BROWSER_MATRIX=1 (e.g. nightly / pre-release).
const trimmedMatrix = !!process.env.CI && !process.env.FULL_BROWSER_MATRIX;
const ciProjects = ["setup", "teardown", "chromium", "mobile-chrome"];

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "e2e/html-report" }]]
    : [["html", { open: "on-failure", outputFolder: "e2e/html-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    // --- Setup ---
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
      teardown: "teardown",
    },
    {
      name: "teardown",
      testMatch: /global\.teardown\.ts/,
    },
    // --- Desktop browsers ---
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    // --- Mobile viewports ---
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
  ].filter((p) => !trimmedMatrix || ciProjects.includes(p.name)),
  webServer: {
    command: "npm run dev:web",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    cwd: "../..",
    timeout: 120_000,
  },
});
