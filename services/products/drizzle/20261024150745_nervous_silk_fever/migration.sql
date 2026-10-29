CREATE TABLE "product_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'enabled' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_maintenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"version" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'latest' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" varchar(100) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "product_features_product_id_idx" ON "product_features" ("product_id");--> statement-breakpoint
CREATE INDEX "product_features_key_idx" ON "product_features" ("key");--> statement-breakpoint
CREATE INDEX "product_maintenance_product_id_idx" ON "product_maintenance" ("product_id");--> statement-breakpoint
CREATE INDEX "product_maintenance_status_idx" ON "product_maintenance" ("status");--> statement-breakpoint
CREATE INDEX "product_versions_product_id_idx" ON "product_versions" ("product_id");--> statement-breakpoint
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_maintenance" ADD CONSTRAINT "product_maintenance_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;