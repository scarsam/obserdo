import { zValidator } from "@hono/zod-validator";
import { serverManager } from "../lib/server.js";
import { buildTaskTree } from "@server/utils/task-tree-builder.js";
import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { tasks as tasksSchema, todos as todosSchema } from "../db/schema.js";
import { type TodoContext, todosInsertSchema } from "../utils/types.js";

// GET / - List all todos
const app = new Hono<TodoContext>()
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
	.post("/", zValidator("json", todosInsertSchema), async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { name, description, status, collaboratorPermission } =
			c.req.valid("json");

		const createdTodo = await db
			.insert(todosSchema)
			.values({
				name,
				description,
				status,
				collaboratorPermission,
				userId: user.id,
			})
			.returning();

		return c.json(createdTodo[0]);
	})
	.put("/:id", zValidator("json", todosInsertSchema), async (c) => {
		const user = c.get("user");

		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();
		const { name, description, status, collaboratorPermission } =
			c.req.valid("json");

		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

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

		serverManager.publish(
			`todo-${todo.id}`,
			JSON.stringify({
				type: "todo_updated",
				data: updatedTodo[0],
			}),
		);

		return c.json(updatedTodo[0]);
	})
	.delete("/:id", async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "Unauthorized" }, 401);

		const { id } = c.req.param();
		const todo = await db.query.todos.findFirst({
			where: and(eq(todosSchema.id, id), eq(todosSchema.userId, user.id)),
		});

		if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

		await db.delete(todosSchema).where(eq(todosSchema.id, todo.id));
		return c.json({ success: true });
	});

export default app;
