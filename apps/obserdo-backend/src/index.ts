import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { auth } from "./lib/auth.js";

const app = new Hono();

// ✅ Apply CORS middleware before defining routes
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://obserdo.up.railway.app",
      "https://obserdo.onrender.com",
    ], // or "*" in dev if needed
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/", async (c) => {
  const todos = await db.query.todos.findMany();
  return c.json({ todos });
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
