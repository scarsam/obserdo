import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { corsMiddleware } from "./middleware/cors.js";
import tasksRouter from "./routes/tasks.js";
import todoRouter from "./routes/todos.js";

const { websocket, upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>().basePath("/api");

let server: ReturnType<typeof Bun.serve>;

if (import.meta.main) {
	server = Bun.serve({
		fetch: app.fetch,
		hostname: "0.0.0.0",
		port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
		websocket,
	});
}

const routes = app
	.get(
		"/ws",
		upgradeWebSocket((c) => {
			const todoId = c.req.query("todoId");
			const topic = `todo-${todoId}`;

			return {
				onMessage(event) {
					const data = JSON.parse(event.data as string);

					if (data.type === "cursor_update") {
						const { userId, x, y } = data.payload as unknown as {
							userId: string;
							x: number;
							y: number;
						};

						server.publish(
							topic,
							JSON.stringify({
								type: "cursor_update",
								payload: {
									userId,
									x,
									y,
								},
							}),
						);
					}
				},
				onOpen(_, ws) {
					const rawWs = ws.raw;
					rawWs?.subscribe(topic);

					console.log(`WebSocket opened and subscribed to ${topic}`);
				},

				onClose(_, ws) {
					const rawWs = ws.raw;
					rawWs?.unsubscribe(topic);

					console.log(`WebSocket closed and unsubscribed from ${topic}`);

					rawWs?.close();
				},
			};
		}),
	)
	.use("*", logger())
	.use("*", corsMiddleware)
	.use("*", authMiddleware)
	.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
	.route("/todos", todoRouter)
	.route("/tasks", tasksRouter)
	.get("/health", (c) => c.json({ status: "ok" }));

export type AppType = typeof routes;
export { server, routes };
