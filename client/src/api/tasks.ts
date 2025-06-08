import { queryOptions, useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { client } from "./client";
import { queryClient } from "@/lib/react-query";
import {
	addTaskToCache,
	updateTaskInCache,
	removeTaskFromCache,
} from "@/api/optimistic-updates";
import type { TaskWithChildren, TodoWithTasks } from "./todos";

const $tasksPost = client.api.todos[":id"].tasks.$post;
const $tasksPut = client.api.todos[":id"].tasks[":taskId"].$put;
const $tasksBulkPut = client.api.todos[":id"].tasks["bulk-edit"].$put;
const $tasksDelete = client.api.todos[":id"].tasks[":taskId"].$delete;

// Request types
export type CreateTaskRequest = InferRequestType<typeof $tasksPost>["json"] &
	InferRequestType<typeof $tasksPost>["param"];
export type UpdateTaskRequest = InferRequestType<typeof $tasksPut>["json"] &
	InferRequestType<typeof $tasksPut>["param"];
export type BulkUpdateTaskRequest = InferRequestType<
	typeof $tasksBulkPut
>["json"];

// API functions
export const tasksQueryOptions = (todoId: string) =>
	queryOptions({
		queryKey: ["tasks", todoId],
		queryFn: async () => {
			const res = await client.api.todos[":id"].$get({
				param: { id: todoId },
			});

			if (!res.ok) throw new Error("Failed to fetch tasks");

			const data = await res.json();
			return data.tasks;
		},
		staleTime: 1000 * 60 * 5,
	});

export const createTask = async ({ id, ...data }: CreateTaskRequest) => {
	const res = await $tasksPost({
		param: { id },
		json: data,
	});
	if (!res.ok) throw new Error("Failed to create task");
	return res.json();
};

export const updateTask = async ({
	id,
	taskId,
	...data
}: UpdateTaskRequest) => {
	const res = await $tasksPut({
		param: { id, taskId },
		json: data,
	});

	if (!res.ok) throw new Error("Failed to update task");

	return res.json();
};

export const bulkUpdateTasks = async ({
	id,
	...data
}: { id: string; json: BulkUpdateTaskRequest }) => {
	const res = await $tasksBulkPut({
		param: { id },
		json: data.json,
	});

	if (!res.ok) throw new Error("Failed to update tasks");

	return res.json();
};

export const deleteTask = async ({
	id,
	taskId,
}: { id: string; taskId: string }) => {
	const res = await $tasksDelete({
		param: { id, taskId },
	});

	if (!res.ok) throw new Error("Failed to delete task");

	return res.json();
};

// Mutations
export const useCreateTaskMutation = (todoId: string) =>
	useMutation({
		mutationFn: createTask,

		onMutate: async (newTask) => {
			await queryClient.cancelQueries({ queryKey: ["todo", todoId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoId,
			]);
			if (!previousTodo) throw new Error("No previous todo found");

			const optimisticTask: TaskWithChildren = {
				id: crypto.randomUUID(),
				name: newTask.name,
				completed: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				parentTaskId: newTask.parentTaskId ?? null,
				todoListId: todoId,
				children: [],
			};

			const optimisticTodo = addTaskToCache(previousTodo, optimisticTask);

			queryClient.setQueryData(["todo", todoId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _newTask, context) => {
			if (todoId && context?.previousTodo) {
				queryClient.setQueryData(["todo", todoId], context.previousTodo);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
		},
	});

export const useEditTaskMutation = (todoListId?: string) =>
	useMutation({
		mutationFn: updateTask,

		onMutate: async (newTask) => {
			if (!todoListId) throw new Error("Missing todoListId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoListId,
			]);
			if (!previousTodo) throw new Error("No previous todo found");

			const updatedTask: TaskWithChildren = {
				id: newTask.taskId,
				name: newTask.name ?? "",
				todoListId,
				parentTaskId: newTask.parentTaskId ?? null,
				completed: newTask.completed ?? false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				children: [],
			};

			const optimisticTodo = updateTaskInCache(previousTodo, updatedTask);

			queryClient.setQueryData(["todo", todoListId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _newTask, context) => {
			if (todoListId && context?.previousTodo) {
				queryClient.setQueryData(["todo", todoListId], context.previousTodo);
			}
		},

		onSettled: () => {
			if (todoListId) {
				queryClient.invalidateQueries({ queryKey: ["todo", todoListId] });
			}
		},
	});

export const useBulkEditTasksMutation = (todoListId?: string) =>
	useMutation({
		mutationFn: (edits: BulkUpdateTaskRequest) => {
			if (!todoListId) throw new Error("Missing todoListId");

			return bulkUpdateTasks({ id: todoListId, json: edits });
		},

		onMutate: async (edits) => {
			if (!todoListId) throw new Error("Missing todoListId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoListId,
			]);
			if (!previousTodo) throw new Error("No previous todo found");

			const now = new Date().toISOString();

			const tasksToUpdate = edits.map((edit) => ({
				id: edit.id ?? crypto.randomUUID(),
				name: edit.name ?? "",
				todoListId,
				parentTaskId: edit.parentTaskId ?? null,
				completed: edit.completed ?? false,
				createdAt: now,
				updatedAt: now,
				children: [],
			}));

			const optimisticTodo = tasksToUpdate.reduce((todo, task) => {
				return updateTaskInCache(todo, task);
			}, previousTodo);

			queryClient.setQueryData(["todo", todoListId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _edits, context) => {
			if (context?.previousTodo) {
				queryClient.setQueryData(["todo", todoListId], context.previousTodo);
			}
		},

		onSettled: () => {
			if (todoListId) {
				queryClient.invalidateQueries({ queryKey: ["todo", todoListId] });
			}
		},
	});

export const useDeleteTaskMutation = (todoListId?: string) =>
	useMutation({
		mutationFn: deleteTask,

		onMutate: async (deleted) => {
			if (!todoListId) throw new Error("Missing todoListId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoListId,
			]);
			if (!previousTodo) throw new Error("No previous todo found");

			const optimisticTodo = removeTaskFromCache(previousTodo, deleted.taskId);

			queryClient.setQueryData(["todo", todoListId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _deleted, context) => {
			if (todoListId && context?.previousTodo) {
				queryClient.setQueryData(["todo", todoListId], context.previousTodo);
			}
		},

		onSettled: () => {
			if (todoListId) {
				queryClient.invalidateQueries({ queryKey: ["todo", todoListId] });
			}
		},
	});
