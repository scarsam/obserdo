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

let server: ReturnType<typeof Bun.serve> | null = null;

const routes = app
	.use("*", logger())
	.use("*", corsMiddleware)
	.use("*", authMiddleware)
	.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
	.route("/todos", todoRouter)
	.route("/tasks", tasksRouter)
	.get("/health", (c) => c.json({ status: "ok" }))
	.get(
		"/ws",
		upgradeWebSocket((c) => {
			const todoId = c.req.query("todoId");
			const topic = `todo-${todoId}`;

			return {
				onMessage(event) {
					try {
						const data = JSON.parse(event.data as string);

						if (data.type === "cursor_update") {
							const { userId, x, y } = data.payload as {
								userId: string;
								x: number;
								y: number;
							};

							// Check if server exists before publishing
							if (server) {
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
							} else {
								console.warn("Server not available for publishing");
							}
						}
					} catch (error) {
						console.error("Error processing WebSocket message:", error);
					}
				},

				onOpen(_, ws) {
					try {
						const rawWs = ws.raw;
						rawWs?.subscribe(topic);
						console.log(`WebSocket opened and subscribed to ${topic}`);
					} catch (error) {
						console.error("Error in WebSocket onOpen:", error);
					}
				},

				onClose(_, ws) {
					try {
						const rawWs = ws.raw;
						rawWs?.unsubscribe(topic);
						console.log(`WebSocket closed and unsubscribed from ${topic}`);
						// Don't call rawWs?.close() here - it's already closing
					} catch (error) {
						console.error("Error in WebSocket onClose:", error);
					}
				},

				onError(_, error) {
					console.error("WebSocket error:", error);
				},
			};
		}),
	);

// Create server instance after routes are defined
if (import.meta.main) {
	try {
		server = Bun.serve({
			fetch: app.fetch,
			hostname: "0.0.0.0",
			port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
			websocket,
		});

		console.log(`🚀 Server started at ${new Date().toISOString()}`);
		console.log(`📡 WebSocket server running on ws://localhost:${server.port}`);
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

// Add global error handlers
process.on("uncaughtException", (error) => {
	console.error("❌ Uncaught Exception:", error);
	// Don't exit in development, just log
	if (process.env.NODE_ENV === "production") {
		process.exit(1);
	}
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	// Don't exit in development, just log
	if (process.env.NODE_ENV === "production") {
		process.exit(1);
	}
});

export type AppType = typeof routes;
export { server, routes };
