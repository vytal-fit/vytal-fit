import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("contracts", () => {
  it("create + list a member contract (with member name)", async () => {
    const created = await h.callerA.contracts.create({
      memberId: IDS.memberA1,
      contractType: "Contrato de Adesão",
      status: "pending",
    });
    expect(created?.status).toBe("pending");

    const rows = await h.callerA.contracts.list();
    const row = rows.find((r) => r.id === created!.id);
    expect(row?.memberName).toBeTruthy();
  });

  it("sign stamps signedDate", async () => {
    const created = await h.callerA.contracts.create({
      memberId: IDS.memberA1,
      contractType: "PAR-Q",
      status: "pending",
    });
    const signed = await h.callerA.contracts.sign({ id: created!.id });
    expect(signed?.status).toBe("signed");
    expect(signed?.signedDate).toBeTruthy();
  });

  it("templates: create + update (admin), list", async () => {
    const tpl = await h.callerA.contracts.createTemplate({ name: "RGPD", required: true });
    const upd = await h.callerA.contracts.updateTemplate({ id: tpl!.id, name: "RGPD v2", required: false });
    expect(upd?.name).toBe("RGPD v2");
    const list = await h.callerA.contracts.templates();
    expect(list.some((x) => x.id === tpl!.id)).toBe(true);
  });

  it("create validates the member belongs to the org (NOT_FOUND)", async () => {
    await expect(
      h.callerA.contracts.create({ memberId: IDS.memberB1, contractType: "X" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("athlete gets FORBIDDEN creating a contract (staff+)", async () => {
    await expect(
      h.callerAthleteA.contracts.create({ memberId: IDS.memberA1, contractType: "X" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("cross-tenant: org B never sees org A contracts", async () => {
    const rows = await h.callerB.contracts.list();
    expect(rows.every((r) => r.memberId !== IDS.memberA1)).toBe(true);
  });

  it("list requires a session", async () => {
    await expect(h.callerNoSession.contracts.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
