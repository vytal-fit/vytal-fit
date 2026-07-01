CREATE TABLE "backups" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"format" text NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "backups" ADD CONSTRAINT "backups_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "backups_org_idx" ON "backups" USING btree ("organization_id");