/**
 * Upload procedures — role gating + tenant isolation. Storage is pinned to the
 * in-memory provider so no bytes leave the test. The security invariant: a
 * caller can only write a photo for an entity inside their own active org, and
 * the returned URL is always the signed /api/asset/ capability URL (never a raw ref).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { createHarness, IDS, type TestHarness } from "./helpers";

const PNG_1x1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const IMG = { dataUrl: `data:image/png;base64,${PNG_1x1}` };
const FORBIDDEN = { code: "FORBIDDEN" } as const;

let h: TestHarness;

beforeAll(async () => {
  process.env.OBJECT_STORE = "memory";
  process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long";
  h = await createHarness();
});

describe("uploadAvatar — any authenticated user", () => {
  it("owner uploads their avatar and gets a signed asset URL", async () => {
    const { url } = await h.callerA.uploads.uploadAvatar(IMG);
    expect(url.startsWith("/api/asset/")).toBe(true);
  });

  it("rejects an unauthenticated caller", async () => {
    await expect(h.callerNoSession.uploads.uploadAvatar(IMG)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects an invalid image", async () => {
    await expect(
      h.callerA.uploads.uploadAvatar({ base64: PNG_1x1, contentType: "image/gif" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("uploadOrgLogo — admin+", () => {
  it("coach is FORBIDDEN", async () => {
    await expect(h.callerCoachA.uploads.uploadOrgLogo(IMG)).rejects.toMatchObject(FORBIDDEN);
  });

  it("owner uploads the gym logo", async () => {
    const { url } = await h.callerA.uploads.uploadOrgLogo(IMG);
    expect(url.startsWith("/api/asset/")).toBe(true);
  });
});

describe("uploadMemberPhoto — staff, own org only", () => {
  it("athlete is FORBIDDEN", async () => {
    await expect(
      h.callerAthleteA.uploads.uploadMemberPhoto({ ...IMG, memberId: IDS.memberA1 }),
    ).rejects.toMatchObject(FORBIDDEN);
  });

  it("coach uploads a photo for a member in their org", async () => {
    const { url } = await h.callerCoachA.uploads.uploadMemberPhoto({ ...IMG, memberId: IDS.memberA1 });
    expect(url.startsWith("/api/asset/")).toBe(true);
  });

  it("cannot touch a member from another org (cross-tenant)", async () => {
    await expect(
      h.callerA.uploads.uploadMemberPhoto({ ...IMG, memberId: IDS.memberB1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("uploadCoachPhoto — staff, own org only", () => {
  it("coach uploads a photo for a coach in their org", async () => {
    const { url } = await h.callerCoachA.uploads.uploadCoachPhoto({ ...IMG, coachId: IDS.coachA });
    expect(url.startsWith("/api/asset/")).toBe(true);
  });

  it("cannot touch a coach from another org (cross-tenant)", async () => {
    await expect(
      h.callerA.uploads.uploadCoachPhoto({ ...IMG, coachId: IDS.coachB }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
