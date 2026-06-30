import { beforeAll, describe, expect, it } from "vitest";
import { IDS, createHarness, type TestHarness } from "./helpers";

let h: TestHarness;

beforeAll(async () => {
  h = await createHarness();
});

describe("shop.products", () => {
  it("admin creates a product in the active org", async () => {
    const p = await h.callerA.shop.products.create({
      name: "Aero Tee",
      category: "apparel",
      price: 25,
      stock: 48,
      fulfillment: "external",
      sku: "VT-AERO-TEE-BLK",
      color: "Black",
    });
    expect(p?.organizationId).toBe(IDS.orgA);
    expect(p?.price).toBe("25.00");
    expect(p?.active).toBe(true);
  });

  it("forbids an athlete from creating a product (admin only)", async () => {
    await expect(
      h.callerAthleteA.shop.products.create({ name: "X", price: 10 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lists products scoped to the org", async () => {
    const { items } = await h.callerA.shop.products.list();
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.every((p) => p.organizationId === IDS.orgA)).toBe(true);
  });

  it("cross-tenant: org B cannot read an org A product by id (NOT_FOUND)", async () => {
    const p = await h.callerA.shop.products.create({ name: "Hoodie", price: 35 });
    await expect(h.callerB.shop.products.byId({ id: p.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("shop.suppliers", () => {
  it("admin creates a China supplier; coach can list; athlete cannot", async () => {
    const s = await h.callerA.shop.suppliers.create({
      name: "Shenzhen Gear Co.",
      region: "china",
      leadTimeDays: 21,
    });
    expect(s?.region).toBe("china");

    const { items } = await h.callerCoachA.shop.suppliers.list();
    expect(items.some((x) => x.id === s.id)).toBe(true);

    await expect(h.callerAthleteA.shop.suppliers.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("shop.orders", () => {
  it("places a supplier order with total = price × quantity and routed supplier", async () => {
    const supplier = await h.callerA.shop.suppliers.create({ name: "Dealer A", region: "china" });
    const product = await h.callerA.shop.products.create({
      name: "Crop Top",
      price: 22,
      supplierId: supplier.id,
      fulfillment: "external",
    });

    const order = await h.callerCoachA.shop.orders.create({ productId: product.id, quantity: 3 });
    expect(order?.total).toBe("66.00");
    expect(order?.status).toBe("placed");
    expect(order?.supplierId).toBe(supplier.id);
    expect(order?.organizationId).toBe(IDS.orgA);
  });

  it("cross-tenant: org B cannot order an org A product (NOT_FOUND)", async () => {
    const product = await h.callerA.shop.products.create({ name: "Grips", price: 18 });
    await expect(
      h.callerB.shop.orders.create({ productId: product.id, quantity: 1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("updates order status and tracking code", async () => {
    const product = await h.callerA.shop.products.create({ name: "Backpack", price: 45 });
    const order = await h.callerCoachA.shop.orders.create({ productId: product.id, quantity: 1 });
    const shipped = await h.callerCoachA.shop.orders.updateStatus({
      id: order.id,
      status: "shipped",
      trackingCode: "SF123456789CN",
    });
    expect(shipped?.status).toBe("shipped");
    expect(shipped?.trackingCode).toBe("SF123456789CN");
  });

  it("forbids an athlete from placing an order (staff only)", async () => {
    const product = await h.callerA.shop.products.create({ name: "Tee2", price: 20 });
    await expect(
      h.callerAthleteA.shop.orders.create({ productId: product.id, quantity: 1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
