CREATE TABLE "tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"todo_list_id" integer NOT NULL,
	"completed" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "completed" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_todo_list_id_todos_id_fk" FOREIGN KEY ("todo_list_id") REFERENCES "public"."todos"("id") ON DELETE cascade ON UPDATE no action;
