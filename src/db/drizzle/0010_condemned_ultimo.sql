ALTER TYPE "public"."order_status" ADD VALUE 'REPARANDO';--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "fecha_reparacion" date;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "razon_no_aprobado" text;