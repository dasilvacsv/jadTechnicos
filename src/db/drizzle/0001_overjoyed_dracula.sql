ALTER TYPE "public"."order_status" ADD VALUE 'APROBADO' BEFORE 'ENTREGA_GENERADA';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'NO_APROBADO' BEFORE 'ENTREGA_GENERADA';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'PENDIENTE_AVISAR' BEFORE 'ENTREGA_GENERADA';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'FACTURADO' BEFORE 'ENTREGA_GENERADA';--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN "presupuesto_amount" numeric(10, 2);