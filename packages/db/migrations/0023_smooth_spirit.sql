CREATE TYPE "public"."contract_status" AS ENUM('signed', 'pending', 'expired');--> statement-breakpoint
CREATE TABLE "contract_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"contract_type" text NOT NULL,
	"status" "contract_status" DEFAULT 'pending' NOT NULL,
	"signed_date" date,
	"expiry_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_contracts" ADD CONSTRAINT "member_contracts_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_contracts" ADD CONSTRAINT "member_contracts_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contract_templates_org_idx" ON "contract_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_contracts_org_idx" ON "member_contracts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_contracts_org_status_idx" ON "member_contracts" USING btree ("organization_id","status");