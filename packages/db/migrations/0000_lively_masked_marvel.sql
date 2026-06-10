CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'waitlisted', 'cancelled', 'checked_in', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."coach_role" AS ENUM('head_coach', 'coach', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."exercise_category" AS ENUM('weightlifting', 'gymnastics', 'cardio', 'strength', 'mobility', 'other');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."lead_stage" AS ENUM('lead', 'contacted', 'prospect', 'trial_booked', 'subscribed', 'lost');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'inactive', 'suspended', 'trial');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('booking_confirmed', 'booking_cancelled', 'class_reminder', 'wod_published', 'pr_achieved', 'payment_success', 'payment_failed', 'streak_milestone');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('monthly', 'quarterly', 'semester', 'annual', 'session_pack', 'day_pass', 'trial');--> statement-breakpoint
CREATE TYPE "public"."pr_unit" AS ENUM('kg', 'lbs', 'time', 'reps', 'meters', 'calories');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."wod_scale" AS ENUM('rx', 'scaled', 'rx_plus');--> statement-breakpoint
CREATE TYPE "public"."wod_score_type" AS ENUM('time', 'rounds_reps', 'weight', 'reps', 'distance', 'calories');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"class_id" text NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"booked_at" timestamp DEFAULT now() NOT NULL,
	"checked_in_at" timestamp,
	"qr_code" text
);
--> statement-breakpoint
CREATE TABLE "class_types" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"abbreviation" text NOT NULL,
	"color" text NOT NULL,
	"icon" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"class_type_id" text NOT NULL,
	"location_id" text NOT NULL,
	"coach_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"max_capacity" integer NOT NULL,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"photo" text,
	"role" "coach_role" DEFAULT 'coach' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "exercise_category" NOT NULL,
	"video_url" text,
	"description" text,
	"equipment" jsonb,
	"muscle_groups" jsonb,
	"scaled_variations" jsonb
);
--> statement-breakpoint
CREATE TABLE "gym_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_number" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"photo" text,
	"gender" "gender",
	"date_of_birth" date,
	"nif" text,
	"emergency_contact" text,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"plan_id" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_check_in" timestamp,
	"streak_weeks" integer DEFAULT 0 NOT NULL,
	"total_check_ins" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"stage" "lead_stage" DEFAULT 'lead' NOT NULL,
	"source" text,
	"assigned_coach_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_contact_at" timestamp,
	"trial_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"capacity" integer
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "personal_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"value" text NOT NULL,
	"unit" "pr_unit" NOT NULL,
	"achieved_at" timestamp DEFAULT now() NOT NULL,
	"previous_value" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "plan_type" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"sessions_per_week" integer,
	"max_sessions" integer,
	"allowed_class_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"sessions_used" integer,
	"next_billing_date" date
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wod_results" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"wod_id" text NOT NULL,
	"class_id" text,
	"score" text NOT NULL,
	"score_type" "wod_score_type" NOT NULL,
	"scale" "wod_scale" DEFAULT 'rx' NOT NULL,
	"is_pr" boolean DEFAULT false NOT NULL,
	"rpe" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wods" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"class_type_id" text NOT NULL,
	"date" date NOT NULL,
	"title" text,
	"description" text,
	"parts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_at" timestamp,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_types" ADD CONSTRAINT "class_types_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_class_type_id_class_types_id_fk" FOREIGN KEY ("class_type_id") REFERENCES "public"."class_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_members" ADD CONSTRAINT "gym_members_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_coach_id_coaches_id_fk" FOREIGN KEY ("assigned_coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_wod_id_wods_id_fk" FOREIGN KEY ("wod_id") REFERENCES "public"."wods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wods" ADD CONSTRAINT "wods_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wods" ADD CONSTRAINT "wods_class_type_id_class_types_id_fk" FOREIGN KEY ("class_type_id") REFERENCES "public"."class_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_org_idx" ON "bookings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bookings_org_class_idx" ON "bookings" USING btree ("organization_id","class_id");--> statement-breakpoint
CREATE INDEX "bookings_org_member_idx" ON "bookings" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "bookings_org_status_idx" ON "bookings" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "class_types_org_idx" ON "class_types" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "classes_org_idx" ON "classes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "classes_org_date_idx" ON "classes" USING btree ("organization_id","date");--> statement-breakpoint
CREATE INDEX "coaches_org_idx" ON "coaches" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "gym_members_org_idx" ON "gym_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "gym_members_org_status_idx" ON "gym_members" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "gym_members_org_member_number_idx" ON "gym_members" USING btree ("organization_id","member_number");--> statement-breakpoint
CREATE INDEX "invitation_organization_id_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_org_idx" ON "leads" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "leads_org_stage_idx" ON "leads" USING btree ("organization_id","stage");--> statement-breakpoint
CREATE INDEX "locations_org_idx" ON "locations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_org_idx" ON "notifications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "notifications_org_member_idx" ON "notifications" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "personal_records_org_idx" ON "personal_records" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "personal_records_org_member_idx" ON "personal_records" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_plans_org_idx" ON "subscription_plans" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscription_plans_org_active_idx" ON "subscription_plans" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "subscriptions_org_idx" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscriptions_org_status_idx" ON "subscriptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_org_member_idx" ON "subscriptions" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "wod_results_org_idx" ON "wod_results" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "wod_results_org_wod_idx" ON "wod_results" USING btree ("organization_id","wod_id");--> statement-breakpoint
CREATE INDEX "wod_results_org_member_idx" ON "wod_results" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "wods_org_idx" ON "wods" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "wods_org_date_idx" ON "wods" USING btree ("organization_id","date");