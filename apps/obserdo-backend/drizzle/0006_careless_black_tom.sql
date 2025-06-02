CREATE TYPE "public"."todo_status" AS ENUM('todo', 'in-progress', 'done', 'archived');--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "status" "todo_status" DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "completed";