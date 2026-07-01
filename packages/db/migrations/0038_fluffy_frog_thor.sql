CREATE TABLE "member_referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"referrer_member_id" text NOT NULL,
	"referred_name" text NOT NULL,
	"referred_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_applied" boolean DEFAULT false NOT NULL,
	"reward_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_referrals" ADD CONSTRAINT "member_referrals_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_referrals" ADD CONSTRAINT "member_referrals_referrer_member_id_gym_members_id_fk" FOREIGN KEY ("referrer_member_id") REFERENCES "public"."gym_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_referrals_org_idx" ON "member_referrals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_referrals_referrer_idx" ON "member_referrals" USING btree ("referrer_member_id");