ALTER TABLE "gym_members" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "gym_members" ADD CONSTRAINT "gym_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gym_members_user_id_idx" ON "gym_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gym_members_org_user_id_idx" ON "gym_members" USING btree ("organization_id","user_id");