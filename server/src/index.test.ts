import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import todoRouter from "@server/routes/todos";
import { Hono } from "hono";
import type { Todo, TodoContext } from "@server/utils/types";
import type { auth } from "@server/lib/auth";
import { serverManager } from "@server/index";
import { db } from "@server/db";
import { user, todos } from "@server/db/schema";
import { eq } from "drizzle-orm";

type User = typeof auth.$Infer.Session.user;

describe("Todos API", () => {
	let testApp: Hono<TodoContext>;

	const mockUser: User = {
		id: "1",
		name: "Test User",
		email: "test@example.com",
		emailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		image: "https://example.com/avatar.png",
		isAnonymous: false,
	};

	beforeAll(async () => {
		testApp = new Hono<TodoContext>();
		testApp.use("*", async (c, next) => {
			c.set("user", mockUser);
			await next();
		});
		testApp.route("/todos", todoRouter);

		await db.insert(user).values({
			id: mockUser.id,
			name: mockUser.name,
			email: mockUser.email,
			emailVerified: mockUser.emailVerified,
			createdAt: mockUser.createdAt,
			updatedAt: mockUser.updatedAt,
			image: mockUser.image,
			isAnonymous: mockUser.isAnonymous,
		});
	});

	afterAll(async () => {
		await db.delete(todos).where(eq(todos.userId, mockUser.id));
		await db.delete(user).where(eq(user.id, mockUser.id));
		await serverManager.stop();
	});

	test("should create a new todo", async () => {
		const newTodo = {
			name: "Test Todo",
			description: "This is a test todo",
			status: "todo",
			collaboratorPermission: "write",
		} as const;

		const req = new Request("http://localhost/todos", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newTodo),
		});

		const res = await testApp.fetch(req);
		expect(res.status).toBe(200);

		const responseBody = (await res.json()) as Todo;
		expect(responseBody.name).toBe(newTodo.name);
		expect(responseBody.userId).toBe(mockUser.id);
	});
});
