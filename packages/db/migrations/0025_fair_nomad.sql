CREATE TABLE "coach_certifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"name" text NOT NULL,
	"issued_date" date NOT NULL,
	"expiry_date" date,
	"document_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coach_certifications" ADD CONSTRAINT "coach_certifications_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_certifications" ADD CONSTRAINT "coach_certifications_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coach_certifications_org_idx" ON "coach_certifications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "coach_certifications_coach_idx" ON "coach_certifications" USING btree ("coach_id");