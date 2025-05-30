import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { corsMiddleware } from "./middleware/cors.js";
import { authMiddleware } from "./middleware/auth.js";
import { todosApp } from "./routes/todos.js";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .use("*", corsMiddleware)
  .use("*", authMiddleware)
  .on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
  .route("/api/todos", todosApp);

export type AppType = typeof app;

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 3001),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
