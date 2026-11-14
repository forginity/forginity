ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "user_type" varchar(50) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "purpose" SET DEFAULT 'authentication';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_user_type_idx" ON "users" ("user_type");
