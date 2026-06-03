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
