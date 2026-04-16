CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'Registration' NOT NULL,
	"registration_url" text NOT NULL,
	"accent" text DEFAULT 'navy' NOT NULL,
	"badge" text,
	"badge_secondary" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"entry_points" integer DEFAULT 1 NOT NULL,
	"what_you_get" text,
	"tracking_url" text,
	"sort_order" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partners_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fills" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"ip_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impressions" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"ip_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"admin_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "giveaway_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer,
	"user_id" integer,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"age" integer NOT NULL,
	"city" text NOT NULL,
	"completed_partners" json NOT NULL,
	"screenshot_confirmed" boolean DEFAULT false NOT NULL,
	"screenshot_url" text,
	"agreed_to_terms" boolean DEFAULT false NOT NULL,
	"ip_hash" text,
	"entry_count" integer DEFAULT 1 NOT NULL,
	"entry_code" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"prize" text NOT NULL,
	"prize_value" text,
	"max_spots" integer DEFAULT 100 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"image_url" text,
	"slug" text NOT NULL,
	"partner_ids" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ends_at" timestamp,
	CONSTRAINT "contests_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"city" text,
	"bio" text,
	"avatar_url" text,
	"profile_slug" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"selected_badge" text,
	"membership_tier" text DEFAULT 'free' NOT NULL,
	"membership_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_profile_slug_unique" UNIQUE("profile_slug")
);
--> statement-breakpoint
CREATE TABLE "winners" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"entry_id" integer,
	"winner_name" text NOT NULL,
	"winner_city" text,
	"prize" text NOT NULL,
	"entry_code" text,
	"announced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_partner_id" integer NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_conversions" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_partner_id" integer NOT NULL,
	"referred_user_id" integer,
	"contest_id" integer,
	"type" text DEFAULT 'signup' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"bio" text,
	"social_media" json,
	"motivation" text,
	"audience_size" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_partners_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"contest_alerts" boolean DEFAULT true NOT NULL,
	"winner_announcements" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" text NOT NULL,
	"icon" text DEFAULT 'bell' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"data" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fills" ADD CONSTRAINT "form_fills_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impressions" ADD CONSTRAINT "impressions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_clicks" ADD CONSTRAINT "referral_clicks_referral_partner_id_referral_partners_id_fk" FOREIGN KEY ("referral_partner_id") REFERENCES "public"."referral_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_conversions" ADD CONSTRAINT "referral_conversions_referral_partner_id_referral_partners_id_fk" FOREIGN KEY ("referral_partner_id") REFERENCES "public"."referral_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_conversions" ADD CONSTRAINT "referral_conversions_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_partners" ADD CONSTRAINT "referral_partners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;