import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import {
  storeOrders,
  storeProducts,
  suppliers,
  STORE_PRODUCT_CATEGORIES,
  STORE_FULFILLMENTS,
  STORE_ORDER_STATUSES,
  SUPPLIER_REGIONS,
  SUPPLIER_STATUSES,
} from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, staffProcedure, router } from "../trpc";

const money = z.number().nonnegative().max(1_000_000);

const productInput = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(STORE_PRODUCT_CATEGORIES).default("apparel"),
  price: money,
  currency: z.string().length(3).default("EUR"),
  stock: z.number().int().min(0).default(0),
  fulfillment: z.enum(STORE_FULFILLMENTS).default("external"),
  supplierId: z.string().min(1).optional(),
  sku: z.string().max(60).optional(),
  color: z.string().max(60).optional(),
  size: z.string().max(60).optional(),
  branding: z.string().max(200).optional(),
});

const supplierInput = z.object({
  name: z.string().min(1).max(200),
  region: z.enum(SUPPLIER_REGIONS).default("china"),
  status: z.enum(SUPPLIER_STATUSES).default("active"),
  contact: z.string().max(200).optional(),
  leadTimeDays: z.number().int().min(0).max(365).optional(),
  notes: z.string().max(2000).optional(),
});

const productsRouter = router({
  list: orgProcedure
    .input(
      z
        .object({
          category: z.enum(STORE_PRODUCT_CATEGORIES).optional(),
          activeOnly: z.boolean().default(false),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ activeOnly: false, limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(storeProducts)
        .where(
          and(
            eq(storeProducts.organizationId, ctx.activeOrganizationId),
            input.category ? eq(storeProducts.category, input.category) : undefined,
            input.activeOnly ? eq(storeProducts.active, true) : undefined,
            input.cursor ? gt(storeProducts.id, input.cursor) : undefined,
          ),
        )
        .orderBy(asc(storeProducts.id))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  byId: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(storeProducts)
        .where(
          and(
            eq(storeProducts.id, input.id),
            eq(storeProducts.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      return row;
    }),

  create: adminProcedure.input(productInput).mutation(async ({ ctx, input }) => {
    const { price, ...rest } = input;
    const [row] = await ctx.db
      .insert(storeProducts)
      .values({
        id: crypto.randomUUID(),
        organizationId: ctx.activeOrganizationId,
        price: price.toFixed(2),
        ...rest,
      })
      .returning();
    return row;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string().min(1), data: productInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const { price, ...rest } = input.data;
      const [row] = await ctx.db
        .update(storeProducts)
        .set({ ...rest, ...(price !== undefined ? { price: price.toFixed(2) } : {}) })
        .where(
          and(
            eq(storeProducts.id, input.id),
            eq(storeProducts.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      return row;
    }),

  archive: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(storeProducts)
        .set({ active: false })
        .where(
          and(
            eq(storeProducts.id, input.id),
            eq(storeProducts.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      return row;
    }),
});

const suppliersRouter = router({
  list: staffProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.organizationId, ctx.activeOrganizationId))
      .orderBy(asc(suppliers.name));
    return { items };
  }),

  create: adminProcedure.input(supplierInput).mutation(async ({ ctx, input }) => {
    const [row] = await ctx.db
      .insert(suppliers)
      .values({ id: crypto.randomUUID(), organizationId: ctx.activeOrganizationId, ...input })
      .returning();
    return row;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string().min(1), data: supplierInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(suppliers)
        .set(input.data)
        .where(
          and(
            eq(suppliers.id, input.id),
            eq(suppliers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Supplier not found." });
      return row;
    }),
});

const ordersRouter = router({
  list: staffProcedure
    .input(
      z
        .object({
          status: z.enum(STORE_ORDER_STATUSES).optional(),
          cursor: z.string().nullish(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(storeOrders)
        .where(
          and(
            eq(storeOrders.organizationId, ctx.activeOrganizationId),
            input.status ? eq(storeOrders.status, input.status) : undefined,
            input.cursor ? gt(storeOrders.id, input.cursor) : undefined,
          ),
        )
        .orderBy(desc(storeOrders.placedAt))
        .limit(input.limit + 1);

      let nextCursor: string | null = null;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]?.id ?? null;
      }
      return { items: rows, nextCursor };
    }),

  byId: staffProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(storeOrders)
        .where(
          and(
            eq(storeOrders.id, input.id),
            eq(storeOrders.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      return row;
    }),

  /** Place a supplier order for a product. Total = product price × quantity. */
  create: staffProcedure
    .input(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(100000).default(1),
        memberId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .select()
        .from(storeProducts)
        .where(
          and(
            eq(storeProducts.id, input.productId),
            eq(storeProducts.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });

      const total = (Number(product.price) * input.quantity).toFixed(2);
      const [row] = await ctx.db
        .insert(storeOrders)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          productId: product.id,
          supplierId: product.supplierId,
          memberId: input.memberId,
          quantity: input.quantity,
          total,
          currency: product.currency,
          status: "placed",
        })
        .returning();
      return row;
    }),

  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(STORE_ORDER_STATUSES),
        trackingCode: z.string().max(120).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(storeOrders)
        .set({
          status: input.status,
          ...(input.trackingCode !== undefined ? { trackingCode: input.trackingCode } : {}),
        })
        .where(
          and(
            eq(storeOrders.id, input.id),
            eq(storeOrders.organizationId, ctx.activeOrganizationId),
          ),
        )
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      return row;
    }),
});

export const shopRouter = router({
  products: productsRouter,
  suppliers: suppliersRouter,
  orders: ordersRouter,
});
