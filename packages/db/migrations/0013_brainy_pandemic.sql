CREATE TYPE "public"."lead_activity_type" AS ENUM('note', 'email', 'call', 'whatsapp', 'sms', 'booking', 'stage_change');--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"type" "lead_activity_type" NOT NULL,
	"title" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_activities_org_idx" ON "lead_activities" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lead_activities_lead_idx" ON "lead_activities" USING btree ("lead_id");