CREATE TABLE "automation_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"sequence_id" text NOT NULL,
	"member_email" text NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"last_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "automation_sequences" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"sequence_id" text NOT NULL,
	"step_order" integer DEFAULT 0 NOT NULL,
	"delay_days" integer DEFAULT 0 NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automation_enrollments" ADD CONSTRAINT "automation_enrollments_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_enrollments" ADD CONSTRAINT "automation_enrollments_sequence_id_automation_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."automation_sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_sequences" ADD CONSTRAINT "automation_sequences_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_steps" ADD CONSTRAINT "automation_steps_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_steps" ADD CONSTRAINT "automation_steps_sequence_id_automation_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."automation_sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "automation_enrollments_seq_idx" ON "automation_enrollments" USING btree ("sequence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "automation_enrollments_uq" ON "automation_enrollments" USING btree ("sequence_id","member_email");--> statement-breakpoint
CREATE INDEX "automation_sequences_org_idx" ON "automation_sequences" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "automation_steps_seq_idx" ON "automation_steps" USING btree ("sequence_id");