import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { corsMiddleware } from "./middleware/cors.js";
import { authMiddleware } from "./middleware/auth.js";
import { todosApp } from "./routes/todos.js";
import { createNodeWebSocket } from "@hono/node-ws";

// type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (
//   x: infer R
// ) => void
//   ? R
//   : never;

// type MergeSchema<T extends any[], B extends string> = MergeUnion<
//   T[number] extends infer module
//     ? module extends { path: infer N; routes: infer H }
//       ? H extends Hono<infer _, infer S>
//         ? MergeSchemaPath<S, MergePath<B, N extends string ? N : never>>
//         : never
//       : never
//     : never
// >;

// type MergeRoutes<
//   T extends any[],
//   E extends Env,
//   S extends Schema,
//   B extends string
// > = Hono<E, MergeSchema<T, B> & S, B>;

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app: todosApp,
});

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .use("*", corsMiddleware)
  .use("*", authMiddleware)
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .route("/api/todos", todosApp);

const { injectWebSocket2, upgradeWebSocket2 } = createNodeWebSocket({
  app,
});

const wsApp = app.get(
  "/ws",
  upgradeWebSocket((c) => ({
    onMessage(event, ws) {
      console.log(`Message from client: ${event.data}`);
      ws.send("Hello from server!");
    },
    onClose: () => {
      console.log("Connection closed");
    },
  }))
);

export type AppType = typeof app;

const server = serve(
  {
    fetch: wsApp.fetch,
    port: Number(process.env.PORT ?? 3001),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

injectWebSocket(server);
