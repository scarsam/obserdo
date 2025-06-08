import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { corsMiddleware } from "./middleware/cors.js";
import { authMiddleware } from "./middleware/auth.js";
import { todosApp } from "./routes/todos.js";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";

const { websocket, upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
}>();

export const server = Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
	websocket,
});

const routes = app
	.use("*", corsMiddleware)
	.use("*", authMiddleware)
	.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
	.route("/api/todos", todosApp)
	.get(
		"/ws",
		upgradeWebSocket((c) => {
			const todoId = c.req.query("todoId");
			const topic = `todo-${todoId}`;

			return {
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
	);

export default routes;
export type AppType = typeof routes;
