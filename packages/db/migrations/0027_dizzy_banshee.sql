CREATE TABLE "class_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"class_type" text NOT NULL,
	"time" text NOT NULL,
	"duration" text NOT NULL,
	"coach" text NOT NULL,
	"capacity" integer DEFAULT 20 NOT NULL,
	"location" text NOT NULL,
	"days" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_templates" ADD CONSTRAINT "class_templates_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_templates_org_idx" ON "class_templates" USING btree ("organization_id");