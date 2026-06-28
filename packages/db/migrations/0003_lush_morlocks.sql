CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"number" integer NOT NULL,
	"subject" text NOT NULL,
	"member_name" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"assigned_to" text NOT NULL,
	"description" text NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"internal_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "support_tickets_org_idx" ON "support_tickets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "support_tickets_org_status_idx" ON "support_tickets" USING btree ("organization_id","status");