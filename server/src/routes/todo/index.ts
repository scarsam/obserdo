import { zValidator } from "@hono/zod-validator";
import { db } from "../../db/index.js";
import { and, asc, eq } from "drizzle-orm";
import { todos as todosSchema } from "../../db/schema.js";
import { todoRouter, todosInsertSchema } from "./types.js";

// GET / - List all todos
todoRouter.get("/", async (c) => {
	const user = c.get("user");
	if (!user) return c.json({ error: "Unauthorized" }, 401);

	const todos = await db.query.todos.findMany({
		where: eq(todosSchema.userId, user.id),
		orderBy: [asc(todosSchema.createdAt)],
	});

	return c.json(todos);
});

// GET /:id - Get a single todo
todoRouter.get("/:id", async (c) => {
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
	return c.json(todo);
});

// POST / - Create a new todo
todoRouter.post("/", zValidator("json", todosInsertSchema), async (c) => {
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
});

// PUT /:id - Update a todo
todoRouter.put("/:id", zValidator("json", todosInsertSchema), async (c) => {
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

	return c.json(updatedTodo[0]);
});

// DELETE /:id - Delete a todo
todoRouter.delete("/:id", async (c) => {
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

export { todoRouter };
