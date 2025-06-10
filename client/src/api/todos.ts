import { queryClient } from "@/lib/react-query";
import { queryOptions, useMutation } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { client } from "./client";

const $todosPost = client.api.todos.$post;
export type CreateTodo = InferRequestType<typeof $todosPost>["json"];

const $todosPut = client.api.todos[":id"].$put;
export type EditTodo = InferRequestType<typeof $todosPut>["json"] &
	InferRequestType<typeof $todosPut>["param"];

const $todoGet = client.api.todos[":id"].$get;
type TodoResponse = InferResponseType<typeof $todoGet>;
export type TodoWithTasks = Exclude<TodoResponse, { error: string }>;
export type Todo = Omit<TodoWithTasks, "tasks">;

export const todosQueryOptions = () =>
	queryOptions({
		queryKey: ["todos"] as const,
		queryFn: async () => {
			const res = await client.api.todos.$get();

			if (!res.ok) throw new Error("Failed to fetch todos");

			return res.json();
		},
		staleTime: 1000 * 60 * 5,
	});

export const todoQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["todo", id] as const,
		queryFn: async () => {
			const res = await client.api.todos[":id"].$get({ param: { id } });

			if (!res.ok) throw new Error("Failed to fetch todo");

			return res.json();
		},
		staleTime: 1000 * 60 * 5,
	});

export const createTodo = async (newTodo: CreateTodo) => {
	const res = await client.api.todos.$post({ json: newTodo });

	if (!res.ok) throw new Error("Failed to create todo");

	return res.json();
};

export const editTodo = async (editTodo: EditTodo) => {
	const res = await client.api.todos[":id"].$put({
		param: { id: editTodo.id },
		json: editTodo,
	});
	if (!res.ok) throw new Error("Failed to edit todo");

	return res.json();
};

export const useCreateTodoMutation = () =>
	useMutation({
		mutationFn: createTodo,
		onMutate: async (newTodo) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

			const optimisticTodo = {
				id: crypto.randomUUID(),
				name: newTodo.name,
				description: newTodo.description ?? null,
				status: newTodo.status ?? "todo",
				collaboratorPermission: newTodo.collaboratorPermission ?? "read",
				userId: "current-user",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tasks: [],
			};

			queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) => [
				...oldTodos,
				optimisticTodo,
			]);

			return { previousTodos };
		},
		onError: (_err, _newTodo, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

export const useEditTodoMutation = () =>
	useMutation({
		mutationFn: editTodo,
		onMutate: async (newTodo) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

			queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) =>
				oldTodos.map((todo) =>
					todo.id === newTodo.id
						? {
								...todo,
								name: newTodo.name,
								description: newTodo.description ?? todo.description,
								status: newTodo.status ?? todo.status,
								collaboratorPermission:
									newTodo.collaboratorPermission ?? todo.collaboratorPermission,
								updatedAt: new Date().toISOString(),
							}
						: todo,
				),
			);

			return { previousTodos };
		},
		onError: (_err, _newTodo, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
