import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { routes } from "./index";
import type { Todo, Task } from "./utils/types";

type TaskWithChildren = Task & {
	children: TaskWithChildren[];
};

type TodoWithTasks = Omit<Todo, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
	tasks: TaskWithChildren[];
};

describe("WebSocket Server", () => {
	const { websocket } = createBunWebSocket<ServerWebSocket>();
	let server: ReturnType<typeof Bun.serve>;

	beforeEach(() => {
		server = Bun.serve({
			fetch: routes.fetch,
			hostname: "localhost",
			port: 0, // Use random port
			websocket,
		});
	});

	afterEach(() => {
		server.stop();
	});

	it("should handle WebSocket connections", async () => {
		const ws = new WebSocket(
			`ws://localhost:${server.port}/ws?todoId=test-todo-id`,
		);

		await new Promise<void>((resolve) => {
			ws.onopen = () => {
				expect(ws.readyState).toBe(WebSocket.OPEN);
				resolve();
			};
		});

		ws.close();
	});

	it("should broadcast cursor positions to other clients", async () => {
		const ws1 = new WebSocket(
			`ws://localhost:${server.port}/ws?todoId=test-todo-id`,
		);
		const ws2 = new WebSocket(
			`ws://localhost:${server.port}/ws?todoId=test-todo-id`,
		);

		// Wait for both connections to open
		await Promise.all([
			new Promise<void>((resolve) => {
				ws1.onopen = () => resolve();
			}),
			new Promise<void>((resolve) => {
				ws2.onopen = () => resolve();
			}),
		]);

		// Set up message listener on second client
		const receivedMessages: string[] = [];
		ws2.onmessage = (event: MessageEvent<string>) => {
			if (typeof event.data === "string") {
				receivedMessages.push(event.data);
			}
		};

		// Send cursor position from first client
		const cursorMessage = JSON.stringify({
			type: "cursor_update",
			payload: {
				userId: "test-user",
				x: 100,
				y: 200,
			},
		});

		ws1.send(cursorMessage);

		// Wait for message to be received
		await new Promise<void>((resolve) => {
			setTimeout(() => {
				expect(receivedMessages).toHaveLength(1);
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				expect(JSON.parse(receivedMessages[0]!)).toEqual({
					type: "cursor_update",
					payload: {
						userId: "test-user",
						x: 100,
						y: 200,
					},
				});
				resolve();
			}, 100);
		});

		ws1.close();
		ws2.close();
	});
});

describe("HTTP Endpoints", () => {
	const client = testClient(routes);

	it("should return health check", async () => {
		const res = await client.health.$get();
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});

	it("should handle todo routes", async () => {
		// Test todo creation
		const createRes = await client.api.todos.$post({
			json: {
				name: "Test Todo",
				description: "Test Description",
				status: "todo",
				collaboratorPermission: "read",
			},
		});
		expect(createRes.status).toBe(201);
		const todoResponse = await createRes.json();
		if ("error" in todoResponse) {
			throw new Error(`Failed to create todo: ${todoResponse.error}`);
		}
		const todo = todoResponse as TodoWithTasks;
		expect(todo).toHaveProperty("id");
		expect(todo.name).toBe("Test Todo");

		// Test todo retrieval
		if (!todo.id) {
			throw new Error("Created todo is missing an id");
		}

		const getRes = await client.api.todos[":id"].$get({
			param: { id: todo.id },
		});
		expect(getRes.status).toBe(200);
		const retrievedTodoResponse = await getRes.json();
		if ("error" in retrievedTodoResponse) {
			throw new Error(
				`Failed to retrieve todo: ${retrievedTodoResponse.error}`,
			);
		}
		const retrievedTodo = retrievedTodoResponse as unknown as TodoWithTasks;
		expect(retrievedTodo.id).toBe(todo.id);
		expect(retrievedTodo.name).toBe(todo.name);
		expect(retrievedTodo.description).toBe(todo.description);
		expect(retrievedTodo.status).toBe(todo.status);
		expect(retrievedTodo.collaboratorPermission).toBe(
			todo.collaboratorPermission,
		);
		expect(retrievedTodo.userId).toBe(todo.userId);
		expect(retrievedTodo.tasks).toBeDefined();
		expect(Array.isArray(retrievedTodo.tasks)).toBe(true);
	});
});
