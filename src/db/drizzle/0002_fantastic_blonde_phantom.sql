CREATE TABLE "service_order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"notes" text,
	"presupuesto_amount" numeric(10, 2),
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "service_order_status_history" ADD CONSTRAINT "service_order_status_history_service_order_id_service_orders_id_fk" FOREIGN KEY ("service_order_id") REFERENCES "public"."service_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_order_status_history" ADD CONSTRAINT "service_order_status_history_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;