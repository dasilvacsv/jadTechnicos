ALTER TABLE "service_orders" ADD COLUMN "cancellation_notes" text;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "rescheduled_from_cancellation" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "cancellation_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "cancellation_type" varchar(20);