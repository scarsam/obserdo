import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { auth } from "./lib/auth.js";
import { todos } from "db/schema";

const app = new Hono();

// ✅ Apply CORS middleware before defining routes
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://obserdo.onrender.com"], // or "*" in dev if needed
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/api/todos", async (c) => {
  const todos = await db.query.todos.findMany();
  return c.json(todos);
});

app.post("/api/todos", async (c) => {
  const newTodo = await c.req.json();

  const createdTodo = await db
    .insert(todos)
    .values({
      name: newTodo.name,
      description: newTodo.description,
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
