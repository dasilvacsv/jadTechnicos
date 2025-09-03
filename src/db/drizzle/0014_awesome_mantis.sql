ALTER TABLE "delivery_notes" ADD COLUMN "type" varchar(20) DEFAULT 'NOTA';--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "order_code" numeric(10, 0);