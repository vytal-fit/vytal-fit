/**
 * Regression test for the PRODUCTION seed (`@vytal-fit/db/seed`), run against
 * an in-memory PGlite database with the real migrations. Locks the F1 seed
 * contract: 3 demo orgs, org-1 fully populated, settings for all, idempotent.
 *
 * org-2/org-3 now also receive a core domain dataset (coaches, locations, class
 * types, members, plans, leads); date-relative entities follow with F2 wiring.
 */
import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { schema } from "@vytal-fit/db";
import { seedDatabase } from "@vytal-fit/db/seed";
import { createTestDb } from "./helpers";

describe("seedDatabase — production seed", () => {
  it("creates the 3 demo orgs, populates org-1 domain data and settings for all", async () => {
    const db = await createTestDb();
    // No auth instance → demo users/memberships are skipped; domain still seeds.
    await seedDatabase(db);

    const orgs = await db
      .select({ id: schema.organization.id })
      .from(schema.organization);
    expect(orgs.map((o) => o.id).sort()).toEqual(["org-1", "org-2", "org-3"]);

    const org1Members = await db
      .select({ id: schema.gymMembers.id })
      .from(schema.gymMembers)
      .where(eq(schema.gymMembers.organizationId, "org-1"));
    expect(org1Members.length).toBeGreaterThan(0);

    const settings = await db
      .select({ id: schema.organizationSettings.organizationId })
      .from(schema.organizationSettings);
    expect(settings.length).toBe(3);
  });

  it("seeds core domain data for org-2 and org-3", async () => {
    const db = await createTestDb();
    await seedDatabase(db);

    for (const orgId of ["org-2", "org-3"] as const) {
      const members = await db
        .select({ id: schema.gymMembers.id })
        .from(schema.gymMembers)
        .where(eq(schema.gymMembers.organizationId, orgId));
      expect(members.length, `${orgId} should have members`).toBeGreaterThan(0);

      const plans = await db
        .select({ id: schema.subscriptionPlans.id })
        .from(schema.subscriptionPlans)
        .where(eq(schema.subscriptionPlans.organizationId, orgId));
      expect(plans.length, `${orgId} should have plans`).toBeGreaterThan(0);
    }
  });

  it("is idempotent — a second run inserts zero new rows", async () => {
    const db = await createTestDb();
    await seedDatabase(db);
    const second = await seedDatabase(db);
    for (const [table, n] of Object.entries(second.inserted)) {
      expect(n, `${table} should insert 0 rows on re-run`).toBe(0);
    }
  });
});
