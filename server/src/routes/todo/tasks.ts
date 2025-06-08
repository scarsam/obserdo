import { zValidator } from "@hono/zod-validator";
import { db } from "../../db/index.js";
import { and, eq } from "drizzle-orm";
import { tasks as tasksSchema, todos as todosSchema } from "../../db/schema.js";
import { todoRouter, tasksInsertSchema } from "./types.js";
import { buildTaskTree } from "../../utils/task-tree-builder.js";
import { server } from "../../index.js";

// GET /:id/tasks - Get all tasks for a todo
todoRouter.get("/:id/tasks", async (c) => {
	const user = c.get("user");
	if (!user) return c.json({ error: "Unauthorized" }, 401);

	const { id } = c.req.param();
	const todo = await db.query.todos.findFirst({
		where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		with: {
			tasks: true,
		},
	});

	if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);
	const nestedTasks = buildTaskTree(todo.tasks);
	return c.json({ ...todo, tasks: nestedTasks });
});

// POST /:id/tasks - Create a new task
todoRouter.post(
	"/:id/tasks",
	zValidator("json", tasksInsertSchema),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();
		const { name, parentTaskId, completed } = c.req.valid("json");

		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
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
	},
);

// PUT /:id/tasks/bulk-edit - Update multiple tasks
todoRouter.put(
	"/:id/tasks/bulk-edit",
	zValidator("json", tasksInsertSchema.array()),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();
		const edits = c.req.valid("json");

		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

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
						and(eq(tasksSchema.id, edit.id), eq(tasksSchema.todoListId, id)),
					)
					.returning();
				if (updated.length > 0) updates.push(updated[0]);
			}
			return updates;
		});

		server.publish(
			`todo-${todo.id}`,
			JSON.stringify({
				type: "task_bulk_updated",
				data: updatedTasks,
			}),
		);

		return c.json(updatedTasks);
	},
);

// PUT /:id/tasks/:taskId - Update a single task
todoRouter.put(
	"/:id/tasks/:taskId",
	zValidator("json", tasksInsertSchema),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id, taskId } = c.req.param();
		const { name, completed } = c.req.valid("json");

		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

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
				type: "task_updated",
				data: updatedTask[0],
			}),
		);

		return c.json(updatedTask[0]);
	},
);

// DELETE /:id/tasks/:taskId - Delete a task
todoRouter.delete("/:id/tasks/:taskId", async (c) => {
	const user = c.get("user");
	if (!user) return c.json({ error: "Unauthorized" }, 401);

	const { id, taskId } = c.req.param();

	const todo = await db.query.todos.findFirst({
		where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
	});

	if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

	const deletedTask = await db
		.delete(tasksSchema)
		.where(and(eq(tasksSchema.id, taskId), eq(tasksSchema.todoListId, todo.id)))
		.returning();

	server.publish(
		`todo-${todo.id}`,
		JSON.stringify({
			type: "task_deleted",
			data: deletedTask[0],
		}),
	);

	return c.json(deletedTask[0]);
});
