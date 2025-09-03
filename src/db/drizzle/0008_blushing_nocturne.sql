ALTER TABLE "delivery_notes" ADD COLUMN "amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "delivery_notes" ADD COLUMN "include_iva" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "include_iva" boolean DEFAULT false;