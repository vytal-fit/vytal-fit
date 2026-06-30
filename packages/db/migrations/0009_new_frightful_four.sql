CREATE TABLE "wellness_checkins" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"member_id" text NOT NULL,
	"date" date NOT NULL,
	"sleep" integer,
	"fatigue" integer,
	"stress" integer,
	"mood" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wellness_checkins" ADD CONSTRAINT "wellness_checkins_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_checkins" ADD CONSTRAINT "wellness_checkins_member_id_gym_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wellness_checkins_org_idx" ON "wellness_checkins" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "wellness_checkins_org_member_idx" ON "wellness_checkins" USING btree ("organization_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wellness_checkins_org_member_date_uk" ON "wellness_checkins" USING btree ("organization_id","member_id","date");