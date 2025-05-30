import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { db } from "../db/index.js";
import { auth } from "../lib/auth.js";

import { todos as todosSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";

const todoSchema = z.object({
  name: z.string(),
  description: z.string(),
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
    });

    return c.json(todos);
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
  });
