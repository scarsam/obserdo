CREATE TYPE "public"."collaborator_permission" AS ENUM('read', 'write');--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "collaboratorPermission" "collaborator_permission" DEFAULT 'read' NOT NULL;