CREATE TYPE "public"."store_fulfillment" AS ENUM('in_house', 'external');--> statement-breakpoint
CREATE TYPE "public"."store_order_status" AS ENUM('draft', 'placed', 'in_production', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."store_product_category" AS ENUM('apparel', 'equipment', 'supplements', 'accessories');--> statement-breakpoint
CREATE TYPE "public"."supplier_region" AS ENUM('china', 'portugal', 'europe');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TABLE "store_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"product_id" text,
	"supplier_id" text,
	"member_id" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"status" "store_order_status" DEFAULT 'placed' NOT NULL,
	"tracking_code" text,
	"placed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_products" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "store_product_category" DEFAULT 'apparel' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"fulfillment" "store_fulfillment" DEFAULT 'external' NOT NULL,
	"supplier_id" text,
	"sku" text,
	"color" text,
	"size" text,
	"branding" text,
	"images" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"region" "supplier_region" DEFAULT 'china' NOT NULL,
	"status" "supplier_status" DEFAULT 'active' NOT NULL,
	"contact" text,
	"lead_time_days" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_product_id_store_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_orders_org_idx" ON "store_orders" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "store_orders_org_status_idx" ON "store_orders" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "store_orders_org_supplier_idx" ON "store_orders" USING btree ("organization_id","supplier_id");--> statement-breakpoint
CREATE INDEX "store_products_org_idx" ON "store_products" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "store_products_org_supplier_idx" ON "store_products" USING btree ("organization_id","supplier_id");--> statement-breakpoint
CREATE INDEX "suppliers_org_idx" ON "suppliers" USING btree ("organization_id");