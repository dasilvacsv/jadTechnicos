CREATE TYPE "public"."instance_role" AS ENUM('administracion', 'ventas', 'sales', 'support', 'billing');--> statement-breakpoint
CREATE TYPE "public"."instance_status" AS ENUM('active', 'inactive', 'deleted');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'AGENT';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'SUPERADMIN';--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"instance_id" text,
	"jwt" text,
	"status" "instance_status" DEFAULT 'active' NOT NULL,
	"role" "instance_role" DEFAULT 'administracion' NOT NULL,
	"ws_url" text,
	"bot_enabled" boolean DEFAULT false,
	"branch_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "instances_instance_id_unique" UNIQUE("instance_id")
);
--> statement-breakpoint
CREATE TABLE "user_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instance_id" uuid NOT NULL,
	"can_manage" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sucursales" ADD COLUMN "whatsapp_instance_id" uuid;--> statement-breakpoint
ALTER TABLE "sucursales" ADD COLUMN "whatsapp_instance_name" text;--> statement-breakpoint
ALTER TABLE "sucursales" ADD COLUMN "whatsapp_instance_status" text DEFAULT 'disconnected';--> statement-breakpoint
ALTER TABLE "sucursales" ADD COLUMN "whatsapp_last_connection" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "branch_id" uuid;--> statement-breakpoint
ALTER TABLE "instances" ADD CONSTRAINT "instances_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_instances" ADD CONSTRAINT "user_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_instances" ADD CONSTRAINT "user_instances_instance_id_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;