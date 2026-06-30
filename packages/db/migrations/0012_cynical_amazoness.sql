CREATE TYPE "public"."sale_payment_method" AS ENUM('cash', 'card', 'mbway', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('pending', 'completed', 'refunded');--> statement-breakpoint
CREATE TABLE "store_sales" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text,
	"customer_name" text NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"payment_method" "sale_payment_method" DEFAULT 'card' NOT NULL,
	"status" "sale_status" DEFAULT 'completed' NOT NULL,
	"sold_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_sales" ADD CONSTRAINT "store_sales_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_sales" ADD CONSTRAINT "store_sales_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_sales_org_idx" ON "store_sales" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "store_sales_org_status_idx" ON "store_sales" USING btree ("organization_id","status");