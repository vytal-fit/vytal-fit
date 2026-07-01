CREATE TABLE "social_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"platform" text DEFAULT 'instagram' NOT NULL,
	"content" text NOT NULL,
	"scheduled_date" date NOT NULL,
	"scheduled_time" text DEFAULT '09:00' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"image_label" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "social_posts_org_idx" ON "social_posts" USING btree ("organization_id");