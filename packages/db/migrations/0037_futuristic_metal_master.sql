CREATE TABLE "class_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"class_id" text NOT NULL,
	"member_name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_feedback" ADD CONSTRAINT "class_feedback_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_feedback" ADD CONSTRAINT "class_feedback_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_feedback_org_idx" ON "class_feedback" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "class_feedback_class_idx" ON "class_feedback" USING btree ("class_id");