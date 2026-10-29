CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" varchar(255) NOT NULL,
	"identifier_type" varchar(20) NOT NULL,
	"otp_hash" text NOT NULL,
	"purpose" varchar(50) DEFAULT 'sign_in' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"session_token_hash" text NOT NULL,
	"current_product_id" uuid,
	"current_section" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"device_type" varchar(50),
	"expires_at" timestamp with time zone NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_emergency_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"relationship" varchar(50),
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"tier" varchar(50) DEFAULT 'free' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"first_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255),
	"phone" varchar(50),
	"password_hash" text,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"gender" varchar(30),
	"country" varchar(2),
	"avatar_url" text,
	"google_id" varchar(255),
	"auth_provider" varchar(50) DEFAULT 'email_otp' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "otps_identifier_idx" ON "otps" ("identifier");--> statement-breakpoint
CREATE INDEX "otps_expires_at_idx" ON "otps" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_idx" ON "sessions" ("session_token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_current_product_id_idx" ON "sessions" ("current_product_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");--> statement-breakpoint
CREATE INDEX "user_emergency_contacts_user_id_idx" ON "user_emergency_contacts" ("user_id");--> statement-breakpoint
CREATE INDEX "user_products_user_id_idx" ON "user_products" ("user_id");--> statement-breakpoint
CREATE INDEX "user_products_product_id_idx" ON "user_products" ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_product_user_product_idx" ON "user_products" ("user_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_idx" ON "users" ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_id_idx" ON "users" ("google_id");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" ("status");--> statement-breakpoint
CREATE INDEX "users_auth_provider_idx" ON "users" ("auth_provider");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_emergency_contacts" ADD CONSTRAINT "user_emergency_contacts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_products" ADD CONSTRAINT "user_products_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;