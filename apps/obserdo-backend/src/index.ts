import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./db/index.js";
import { auth } from "./lib/auth.js";
import { user as userSchema, todos as todosSchema } from "db/schema";
import { corsMiddleware } from "./middleware/cors.js";
import { authMiddleware } from "./middleware/auth.js";
import { eq } from "drizzle-orm";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Middleware setup
app.use("*", corsMiddleware);
app.use("*", authMiddleware);

// Auth handlers
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/api/todos", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const todos = await db.query.todos.findMany({
    where: eq(todosSchema.userId, user.id),
  });

  return c.json(todos);
});

app.post("/api/todos", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const newTodo = await c.req.json();

  const createdTodo = await db
    .insert(todosSchema)
    .values({
      name: newTodo.name,
      description: newTodo.description,
      userId: user.id,
    })
    .returning();

  return c.json(createdTodo);
});

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
