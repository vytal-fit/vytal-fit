CREATE TYPE "public"."check_in_method" AS ENUM('qr', 'kiosk', 'manual', 'app');--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"class_id" text,
	"booking_id" text,
	"method" "check_in_method" DEFAULT 'manual' NOT NULL,
	"checked_in_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"features" jsonb NOT NULL,
	"branding" jsonb NOT NULL,
	"public_site" jsonb NOT NULL,
	"terminology_overrides" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "check_ins_org_idx" ON "check_ins" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "check_ins_org_member_idx" ON "check_ins" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "check_ins_org_checked_in_at_idx" ON "check_ins" USING btree ("organization_id","checked_in_at");--> statement-breakpoint
CREATE INDEX "check_ins_org_class_idx" ON "check_ins" USING btree ("organization_id","class_id");