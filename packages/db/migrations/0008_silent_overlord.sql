CREATE TABLE "workout_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"class_id" text,
	"wod_id" text,
	"rpe" integer,
	"enjoyment" integer,
	"injury_limitation" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_feedback" ADD CONSTRAINT "workout_feedback_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_feedback" ADD CONSTRAINT "workout_feedback_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_feedback" ADD CONSTRAINT "workout_feedback_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_feedback" ADD CONSTRAINT "workout_feedback_wod_id_wods_id_fk" FOREIGN KEY ("wod_id") REFERENCES "public"."wods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workout_feedback_org_idx" ON "workout_feedback" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workout_feedback_org_member_idx" ON "workout_feedback" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "workout_feedback_org_class_idx" ON "workout_feedback" USING btree ("organization_id","class_id");
