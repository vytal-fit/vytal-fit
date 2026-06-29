import { test as base, expect } from "@playwright/test";

/**
 * Custom test fixtures for Vytal E2E tests.
 *
 * Extend this file to add shared helpers, page objects, or per-test
 * setup (e.g., seeding a test org, creating a test member).
 *
 * Usage in tests:
 *   import { test, expect } from "./fixtures/test";
 */

/**
 * Seeded demo accounts (created by `npm run db:seed -w @vytal-fit/db`).
 * All share the same password. `jose` is the owner of org-1 (CrossFit Aveiro).
 */
export const DEMO_PASSWORD = "VytalDemo2026!";
export const DEMO_USERS = {
  owner: { email: "jose@vytal.fit", name: "Jose Fonte" },
  coach: { email: "coach@vytal.fit", name: "Demo Coach" },
  athlete: { email: "athlete@vytal.fit", name: "Demo Athlete" },
} as const;

// Persona types matching the PRD
type Persona = "gestor" | "coach" | "pt" | "athlete";

type VytalFixtures = {
  /** The currently active persona for this test */
  persona: Persona;
};

export const test = base.extend<VytalFixtures>({
  persona: ["gestor", { option: true }],
});

export { expect };
