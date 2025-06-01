import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { db } from "../db/index.js";
import { auth } from "../lib/auth.js";

import { todos as todosSchema, tasks as tasksSchema } from "../db/schema.js";
import { and, asc, eq } from "drizzle-orm";

const todoSchema = z.object({
  name: z.string(),
  description: z.string(),
  completed: z.boolean().optional(),
});

const taskSchema = z.object({
  name: z.string(),
});

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
      where: and(
        eq(todosSchema.id, Number(id)),
        eq(todosSchema.userId, user.id)
      ),
      with: {
        tasks: true,
      },
    });

    if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

    return c.json(todo);
  })
  .put("/:id", zValidator("json", todoSchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { id } = c.req.param();

    const { name, description, completed } = c.req.valid("json");

    const todo = await db.query.todos.findFirst({
      where: and(
        eq(todosSchema.id, Number(id)),
        eq(todosSchema.userId, user.id)
      ),
    });
    if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);
    // Update the todo
    const updatedTodo = await db
      .update(todosSchema)
      .set({ name, description, completed, updatedAt: new Date() })
      .where(eq(todosSchema.id, todo.id))
      .returning();

    return c.json(updatedTodo[0]);
  })
  .post("/", zValidator("json", todoSchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { name, description } = c.req.valid("json");

    const createdTodo = await db
      .insert(todosSchema)
      .values({ name, description, userId: user.id })
      .returning();

    return c.json(createdTodo);
  })
  .post("/:id/tasks", zValidator("json", taskSchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { id } = c.req.param();

    const { name } = c.req.valid("json");

    // First, optionally verify that todo belongs to this user
    const todo = await db.query.todos.findFirst({
      where: and(
        eq(todosSchema.id, Number(id)),
        eq(todosSchema.userId, user.id)
      ),
    });

    if (!todo) return c.json({ error: "Todo not found or unauthorized" }, 404);

    // Insert new task linked to todo ID
    const createdTask = await db
      .insert(tasksSchema)
      .values({
        name,
        todoListId: todo.id,
        completed: false, // default
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json(createdTask[0]);
  });
