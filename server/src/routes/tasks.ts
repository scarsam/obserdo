import { zValidator } from "@hono/zod-validator";
import { and, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { tasks as tasksSchema, todos as todosSchema } from "../db/schema.js";

import { server } from "../index.js";
import { type TodoContext, tasksInsertSchema } from "../utils/types.js";

const app = new Hono<TodoContext>()
	.post("/:todoId/tasks", zValidator("json", tasksInsertSchema), async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { todoId } = c.req.param();

		const { name, parentTaskId, completed } = c.req.valid("json");

		const todo = await db.query.todos.findFirst({
			where: and(
				eq(todosSchema.id, todoId),
				or(
					eq(todosSchema.collaboratorPermission, "write"),
					eq(todosSchema.userId, user.id),
				),
			),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		try {
			const createdTask = await db
				.insert(tasksSchema)
				.values({
					name,
					todoListId: todo.id,
					parentTaskId,
					completed: completed ?? false,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			server?.publish(
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
		"/:todoId/tasks/bulk-edit",
		zValidator("json", tasksInsertSchema.array()),
		async (c) => {
			const user = c.get("user");
			if (!user) return c.json({ error: "Unauthorized" }, 401);

			const { todoId } = c.req.param();
			const edits = c.req.valid("json");

			const todo = await db.query.todos.findFirst({
				where: and(
					eq(todosSchema.id, todoId),
					or(
						eq(todosSchema.collaboratorPermission, "write"),
						eq(todosSchema.userId, user.id),
					),
				),
			});

			if (!todo)
				return c.json({ error: "Todo not found or unauthorized" }, 404);

			const updatedTasks = await db.transaction(async (tx) => {
				const updates = [];
				for (const edit of edits) {
					if (!edit.id) continue;
					const updated = await tx
						.update(tasksSchema)
						.set({
							name: edit.name,
							completed: edit.completed,
							updatedAt: new Date(),
						})
						.where(
							and(
								eq(tasksSchema.id, edit.id),
								eq(tasksSchema.todoListId, todoId),
							),
						)
						.returning();
					if (updated.length > 0) updates.push(updated[0]);
				}

				const allTasks = await tx
					.select({ completed: tasksSchema.completed })
					.from(tasksSchema)
					.where(eq(tasksSchema.todoListId, todoId));

				const allDone = allTasks.every((t) => t.completed === true);

				if (allDone) {
					await tx
						.update(todosSchema)
						.set({
							status: "done",
							updatedAt: new Date(),
						})
						.where(eq(todosSchema.id, todoId));
				}

				if (allTasks.length > 0 && !allDone) {
					await tx
						.update(todosSchema)
						.set({
							status: "in-progress",
							updatedAt: new Date(),
						})
						.where(eq(todosSchema.id, todoId));
				}

				return updates;
			});

			server?.publish(
				`todo-${todo.id}`,
				JSON.stringify({
					type: "task_bulk_updated",
					data: updatedTasks,
				}),
			);

			return c.json(updatedTasks);
		},
	)
	.put(
		"/:todoId/tasks/:taskId/edit",
		zValidator("json", tasksInsertSchema),
		async (c) => {
			const user = c.get("user");

			if (!user) return c.json({ error: "Unauthorized" }, 401);

			const { todoId, taskId } = c.req.param();
			const { name, completed } = c.req.valid("json");

			const todo = await db.query.todos.findFirst({
				where: and(
					eq(todosSchema.id, todoId),
					or(
						eq(todosSchema.collaboratorPermission, "write"),
						eq(todosSchema.userId, user.id),
					),
				),
			});

			if (!todo)
				return c.json({ error: "Todo not found or unauthorized" }, 404);

			const updatedTask = await db
				.update(tasksSchema)
				.set({ name, completed, updatedAt: new Date() })
				.where(
					and(eq(tasksSchema.id, taskId), eq(tasksSchema.todoListId, todo.id)),
				)
				.returning();

			server?.publish(
				`todo-${todo.id}`,
				JSON.stringify({
					type: "task_updated",
					data: updatedTask[0],
				}),
			);

			return c.json(updatedTask[0]);
		},
	)
	.delete("/:todoId/tasks/:taskId", async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { todoId, taskId } = c.req.param();

		const todo = await db.query.todos.findFirst({
			where: and(
				eq(todosSchema.id, todoId),
				or(
					eq(todosSchema.collaboratorPermission, "write"),
					eq(todosSchema.userId, user.id),
				),
			),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		const deletedTask = await db
			.delete(tasksSchema)
			.where(
				and(eq(tasksSchema.id, taskId), eq(tasksSchema.todoListId, todo.id)),
			)
			.returning();

		const allTasks = await db
			.select({ completed: tasksSchema.completed })
			.from(tasksSchema)
			.where(eq(tasksSchema.todoListId, todoId));

		if (allTasks.length === 0) {
			await db
				.update(todosSchema)
				.set({ status: "todo", updatedAt: new Date() })
				.where(eq(todosSchema.id, todoId));
		}

		server?.publish(
			`todo-${todo.id}`,
			JSON.stringify({
				type: "task_deleted",
				data: deletedTask[0],
			}),
		);

		return c.json(deletedTask[0]);
	});

export default app;
