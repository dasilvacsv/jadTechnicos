CREATE TYPE "public"."warranty_priority" AS ENUM('BAJA', 'MEDIA', 'ALTA');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'GARANTIA_APLICADA';--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "razon_garantia" text;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "garantia_prioridad" "warranty_priority";