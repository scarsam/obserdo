import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/index.js";
import { auth } from "../lib/auth.js";
import { z } from "zod";

import {
	todos as todosSchema,
	tasks as tasksSchema,
	todosZodSchema,
	tasksZodSchema,
} from "../db/schema.js";
import { and, asc, eq } from "drizzle-orm";
import { buildTaskTree } from "../utils/task-tree-builder.js";
import { server } from "@server/index.js";

export const todosApp = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>()
	.get("/", async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const todos = await db.query.todos.findMany({
			where: eq(todosSchema.userId, user.id),
			orderBy: [asc(todosSchema.createdAt)],
		});

		return c.json(todos);
	})
	.get("/:id", async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();

		// First, optionally verify that todo belongs to this user
		const todo = await db.query.todos.findFirst({
			where: eq(todosSchema.id, id),
			with: {
				tasks: {
					orderBy: [asc(tasksSchema.createdAt)],
				},
			},
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		const nestedTasks = buildTaskTree(todo.tasks);

		return c.json({ ...todo, tasks: nestedTasks });
	})
	.put("/:id", zValidator("json", todosZodSchema), async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();

		const { name, description, status, collaboratorPermission } =
			c.req.valid("json");

		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});
		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);
		// Update the todo
		const updatedTodo = await db
			.update(todosSchema)
			.set({
				name,
				description,
				status,
				collaboratorPermission,
				updatedAt: new Date(),
			})
			.where(eq(todosSchema.id, todo.id))
			.returning();

		return c.json(updatedTodo[0]);
	})
	.post("/", zValidator("json", todosZodSchema), async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { name, description } = c.req.valid("json");

		const createdTodo = await db
			.insert(todosSchema)
			.values({ name, description, userId: user.id })
			.returning();

		return c.json(createdTodo);
	})
	.post("/:id/tasks", zValidator("json", tasksZodSchema), async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();
		const { name, parentTaskId } = c.req.valid("json");

		// First, optionally verify that todo belongs to this user
		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		try {
			// Create the task
			const createdTask = await db
				.insert(tasksSchema)
				.values({
					name,
					todoListId: todo.id,
					parentTaskId: parentTaskId,
					completed: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			server.publish(
				`todo-${todo.id}`,
				JSON.stringify({
					type: "task_created",
					data: createdTask[0],
				}),
			);

			return c.json(createdTask[0]);
		} catch (error) {
			return c.json({ error: "Failed to create task" }, 500);
		}
	})
	.put(
		"/:id/tasks/bulk-edit",
		zValidator("json", tasksZodSchema.array()),
		async (c) => {
			const user = c.get("user");
			if (!user) return c.json({ error: "Unauthorized" }, 401);

			const { id } = c.req.param();
			const edits = c.req.valid("json");

			// Verify ownership
			const todo = await db.query.todos.findFirst({
				where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
			});

			if (!todo)
				return c.json({ error: "Todo not found or unauthorized" }, 404);

			// Run individual updates inside a transaction
			const updatedTasks = await db.transaction(async (tx) => {
				const updates = [];

				for (const edit of edits) {
					if (!edit.id || !id) continue;

					const updated = await tx
						.update(tasksSchema)
						.set({
							name: edit.name,
							completed: edit.completed,
							updatedAt: new Date(),
						})
						.where(
							and(eq(tasksSchema.id, edit.id), eq(tasksSchema.todoListId, id)),
						)
						.returning();

					if (updated.length > 0) {
						updates.push(updated[0]);
					}
				}

				return updates;
			});

			server.publish(
				`todo-${todo.id}`,
				JSON.stringify({
					type: "bulk_update_tasks",
					data: updatedTasks,
				}),
			);

			return c.json(updatedTasks);
		},
	)
	.put("/:id/tasks/:taskId", zValidator("json", tasksZodSchema), async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id, taskId } = c.req.param();

		const { name, completed } = c.req.valid("json");

		// First, optionally verify that todo belongs to this user
		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		// Update the task
		const updatedTask = await db
			.update(tasksSchema)
			.set({ name, completed, updatedAt: new Date() })
			.where(
				and(eq(tasksSchema.id, taskId), eq(tasksSchema.todoListId, todo.id)),
			)
			.returning();

		server.publish(
			`todo-${todo.id}`,
			JSON.stringify({
				type: "update_task",
				data: updatedTask[0],
			}),
		);

		return c.json(updatedTask[0]);
	})
	.delete("/:id/tasks/:taskId", async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id, taskId } = c.req.param();

		// First, optionally verify that todo belongs to this user
		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		// Delete the task
		const deletedTask = await db
			.delete(tasksSchema)
			.where(
				and(eq(tasksSchema.id, taskId), eq(tasksSchema.todoListId, todo.id)),
			)
			.returning();

		server.publish(
			`todo-${todo.id}`,
			JSON.stringify({
				type: "delete_task",
				data: deletedTask[0],
			}),
		);

		return c.json(deletedTask[0]);
	});
