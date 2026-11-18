ALTER TABLE "users" ADD COLUMN "username" varchar(50);--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" ("username");