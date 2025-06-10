import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Hono } from "hono";
import { tasks, todos } from "../db/schema.js";
import type { auth } from "../lib/auth.js";

// Context type for the router
export type TodoContext = {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
};

// Create the router instance
export const todoRouter = new Hono<TodoContext>();

// Database Schema Types
export type Todo = typeof todos.$inferSelect;
export type TodoInsert = typeof todos.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;

// Validation schemas
export const todosInsertSchema = createInsertSchema(todos).omit({
	userId: true,
});
export const todosSelectSchema = createSelectSchema(todos);

export const tasksInsertSchema = createInsertSchema(tasks).omit({
	todoListId: true,
});
export const tasksSelectSchema = createSelectSchema(tasks);
