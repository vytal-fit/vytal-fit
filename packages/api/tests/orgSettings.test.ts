/**
 * orgSettings router — full matrix:
 *  - auth: UNAUTHORIZED without a session, FORBIDDEN without an active org
 *  - get: stored row (org B) vs ORGANIZATION_CONFIGS-derived defaults (org A,
 *    which the harness deliberately seeds WITHOUT a settings row)
 *  - update: admin+ (coach/athlete FORBIDDEN), Zod rejection, partial
 *    key-wise merge, upsert roundtrip, cross-tenant isolation
 *
 * Ordering matters inside this file: the defaults assertions run BEFORE the
 * update tests materialize a row for org A.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { ORGANIZATION_CONFIGS } from "@vytal-fit/shared";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

const UNAUTHORIZED = { code: "UNAUTHORIZED" } as const;
const FORBIDDEN = { code: "FORBIDDEN" } as const;
const BAD_REQUEST = { code: "BAD_REQUEST" } as const;

describe("auth gates", () => {
  it("rejects callers without a session", async () => {
    await expect(h.callerNoSession.orgSettings.get()).rejects.toMatchObject(
      UNAUTHORIZED,
    );
    await expect(h.callerNoSession.orgSettings.update({})).rejects.toMatchObject(
      UNAUTHORIZED,
    );
  });

  it("rejects callers without an active organization", async () => {
    await expect(h.callerNoOrg.orgSettings.get()).rejects.toMatchObject(FORBIDDEN);
    await expect(h.callerNoOrg.orgSettings.update({})).rejects.toMatchObject(
      FORBIDDEN,
    );
  });
});

describe("get", () => {
  it("derives defaults from ORGANIZATION_CONFIGS when no row exists (org A)", async () => {
    const settings = await h.callerA.orgSettings.get();
    expect(settings.organizationId).toBe(IDS.orgA);
    // org A's metadata says crossfit_box — defaults mirror that vertical.
    expect(settings.features).toEqual(ORGANIZATION_CONFIGS["crossfit_box"]?.features);
    expect(settings.branding).toEqual({ accentColor: "#22c55e", logoUrl: null });
    expect(settings.publicSite).toEqual({ enabled: false, sections: {} });
    expect(settings.terminologyOverrides).toBeNull();
    expect(settings.updatedAt).toBeNull();
  });

  it("any org member (athlete) can read settings", async () => {
    const settings = await h.callerAthleteA.orgSettings.get();
    expect(settings.organizationId).toBe(IDS.orgA);
  });

  it("returns the stored row when one exists (org B)", async () => {
    const settings = await h.callerB.orgSettings.get();
    expect(settings.organizationId).toBe(IDS.orgB);
    expect(settings.features).toEqual(
      ORGANIZATION_CONFIGS["weightlifting_club"]?.features,
    );
    expect(settings.branding).toEqual({ accentColor: "#ef4444", logoUrl: null });
    expect(settings.publicSite.enabled).toBe(true);
    expect(settings.publicSite.slogan).toBe("Lift heavy.");
    expect(settings.terminologyOverrides).toEqual({ member: "Lifter" });
    expect(settings.updatedAt).toBeInstanceOf(Date);
  });

  it("cross-tenant: org A never sees org B's stored settings", async () => {
    const settings = await h.callerA.orgSettings.get();
    expect(settings.branding.accentColor).not.toBe("#ef4444");
    expect(settings.terminologyOverrides).toBeNull();
  });
});

describe("update — admin+", () => {
  it("coach and athlete get FORBIDDEN", async () => {
    await expect(
      h.callerCoachA.orgSettings.update({ features: { wods: false } }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("Admin"),
    });
    await expect(
      h.callerAthleteA.orgSettings.update({ features: { wods: false } }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("rejects invalid input (Zod)", async () => {
    await expect(
      h.callerA.orgSettings.update({
        branding: { accentColor: "green" },
      }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      h.callerA.orgSettings.update({
        // @ts-expect-error features must be booleans
        features: { wods: "yes" },
      }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("first update upserts defaults + patch into a new row", async () => {
    const saved = await h.callerA.orgSettings.update({
      features: { wods: false },
      branding: { accentColor: "#123456" },
    });
    expect(saved?.organizationId).toBe(IDS.orgA);
    // Patched keys applied…
    expect(saved?.features.wods).toBe(false);
    expect(saved?.branding.accentColor).toBe("#123456");
    // …while untouched defaults survive the merge.
    expect(saved?.features.leaderboard).toBe(true);
    expect(saved?.branding.logoUrl).toBeNull();
    expect(saved?.updatedAt).toBeInstanceOf(Date);

    const roundtrip = await h.callerA.orgSettings.get();
    expect(roundtrip.features.wods).toBe(false);
    expect(roundtrip.branding.accentColor).toBe("#123456");
    expect(roundtrip.updatedAt).toBeInstanceOf(Date);
  });

  it("subsequent partial updates merge onto the stored row", async () => {
    const saved = await h.callerA.orgSettings.update({
      publicSite: { enabled: true, slogan: "Forged in Aveiro" },
    });
    expect(saved?.publicSite.enabled).toBe(true);
    expect(saved?.publicSite.slogan).toBe("Forged in Aveiro");
    expect(saved?.publicSite.sections).toEqual({});
    // Earlier patches stay intact.
    expect(saved?.features.wods).toBe(false);
    expect(saved?.branding.accentColor).toBe("#123456");
  });

  it("sets and clears terminology overrides", async () => {
    const withOverrides = await h.callerA.orgSettings.update({
      terminologyOverrides: { member: "Crossfitter" },
    });
    expect(withOverrides?.terminologyOverrides).toEqual({ member: "Crossfitter" });

    const cleared = await h.callerA.orgSettings.update({
      terminologyOverrides: null,
    });
    expect(cleared?.terminologyOverrides).toBeNull();
  });

  it("cross-tenant: org A updates never leak into org B", async () => {
    const orgB = await h.callerB.orgSettings.get();
    expect(orgB.branding.accentColor).toBe("#ef4444");
    expect(orgB.publicSite.slogan).toBe("Lift heavy.");
    expect(orgB.features).toEqual(
      ORGANIZATION_CONFIGS["weightlifting_club"]?.features,
    );
  });
});

describe("profile + payment methods + name", () => {
  it("exposes profile and paymentMethods defaults", async () => {
    const settings = await h.callerB.orgSettings.get();
    expect(settings.profile).toBeDefined();
    expect(settings.profile.currency).toBeDefined();
    expect(settings.paymentMethods).toBeDefined();
    expect(settings.paymentMethods.mbway?.enabled).toBeDefined();
    expect(typeof settings.name).toBe("string");
  });

  it("merges a partial profile patch", async () => {
    const saved = await h.callerA.orgSettings.update({
      profile: { email: "box@aveiro.pt", city: "Aveiro" },
    });
    expect(saved?.profile.email).toBe("box@aveiro.pt");
    expect(saved?.profile.city).toBe("Aveiro");
    // Untouched defaults survive.
    expect(saved?.profile.country).toBeTruthy();

    const roundtrip = await h.callerA.orgSettings.get();
    expect(roundtrip.profile.email).toBe("box@aveiro.pt");
  });

  it("stores payment-method config", async () => {
    const saved = await h.callerA.orgSettings.update({
      paymentMethods: { mbway: { enabled: true, phone: "912345678" } },
    });
    expect(saved?.paymentMethods.mbway?.phone).toBe("912345678");
  });

  it("updates the org's canonical name", async () => {
    const saved = await h.callerA.orgSettings.update({ name: "CrossFit Aveiro X" });
    expect(saved?.name).toBe("CrossFit Aveiro X");
    const roundtrip = await h.callerA.orgSettings.get();
    expect(roundtrip.name).toBe("CrossFit Aveiro X");
  });

  it("rejects an invalid profile email (Zod)", async () => {
    await expect(
      h.callerA.orgSettings.update({ profile: { email: "not-an-email" } }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("exposes the org slug, dropins and websiteConfig defaults", async () => {
    const settings = await h.callerB.orgSettings.get();
    expect(typeof settings.slug).toBe("string");
    expect(settings.dropins).toBeDefined();
    expect(settings.dropins.registration).toBe("all");
    // No website builder config until one is saved.
    expect(settings.websiteConfig).toBeNull();
  });

  it("persists a dropins patch and a websiteConfig blob", async () => {
    const saved = await h.callerA.orgSettings.update({
      dropins: { active: true, price: "20" },
      websiteConfig: { hero: { enabled: true, slogan: "Train hard" } },
    });
    expect(saved?.dropins.active).toBe(true);
    expect(saved?.dropins.price).toBe("20");
    expect(saved?.websiteConfig).toMatchObject({ hero: { slogan: "Train hard" } });

    const roundtrip = await h.callerA.orgSettings.get();
    expect(roundtrip.dropins.active).toBe(true);
    expect(roundtrip.websiteConfig).toMatchObject({ hero: { enabled: true } });
  });
});
