ALTER TYPE "public"."role" ADD VALUE 'TECHNICIAN';--> statement-breakpoint
ALTER TABLE "technicians" ADD COLUMN "password" text;
ALTER TABLE "technicians" ADD COLUMN "role" "role" DEFAULT 'TECHNICIAN';