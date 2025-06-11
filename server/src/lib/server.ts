import type { Server } from "bun";
import type { BunWebSocketData, BunWebSocketHandler } from "hono/bun";

class ServerManager {
	private static instance: ServerManager;
	private server: Server | null = null;
	private isStarting = false;

	private constructor() {}

	static getInstance(): ServerManager {
		if (!ServerManager.instance) {
			ServerManager.instance = new ServerManager();
		}
		return ServerManager.instance;
	}

	async startServer(config: {
		fetch: (request: Request) => Response | Promise<Response>;
		hostname?: string;
		port?: number;
		websocket?: BunWebSocketHandler<BunWebSocketData>;
	}): Promise<Server> {
		// Prevent multiple server starts
		if (this.server) {
			console.log("🔄 Server already running, returning existing instance");
			return this.server;
		}

		if (this.isStarting) {
			// Wait for the current start process to complete
			while (this.isStarting) {
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
			if (this.server) return this.server;
		}

		this.isStarting = true;

		try {
			console.log("🚀 Starting server...");
			this.server = Bun.serve(config);
			console.log(
				`📡 Server running on http://${config.hostname || "localhost"}:${this.server.port}`,
			);
			console.log(
				`🔌 WebSocket server running on ws://${config.hostname || "localhost"}:${this.server.port}`,
			);
			return this.server;
		} catch (error) {
			console.error("❌ Failed to start server:", error);
			throw error;
		} finally {
			this.isStarting = false;
		}
	}

	getServer(): Server | null {
		return this.server;
	}

	publish(topic: string, message: string): boolean {
		if (!this.server) {
			console.warn(
				"⚠️ Server not initialized, cannot publish message to topic:",
				topic,
			);
			return false;
		}

		try {
			this.server.publish(topic, message);
			return true;
		} catch (error) {
			console.error("❌ Failed to publish message:", error);
			return false;
		}
	}

	async stop(): Promise<void> {
		if (this.server) {
			this.server.stop();
			this.server = null;
			console.log("🛑 Server stopped");
		}
	}
}

export const serverManager = ServerManager.getInstance();
