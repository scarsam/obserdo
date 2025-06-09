import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { client } from "./client";
import type { TodoWithTasks } from "./todos";

const $tasksPost = client.api.tasks[":todoId"].tasks.$post;
const $tasksPut = client.api.tasks[":todoId"].tasks[":taskId"].edit.$put;
const $tasksBulkPut = client.api.tasks[":todoId"].tasks["bulk-edit"].$put;
const $tasksDelete = client.api.tasks[":todoId"].tasks[":taskId"].$delete;

// Request types
export type CreateTaskRequest = InferRequestType<typeof $tasksPost>["json"] &
	InferRequestType<typeof $tasksPost>["param"];
export type UpdateTaskRequest = InferRequestType<typeof $tasksPut>["json"] &
	InferRequestType<typeof $tasksPut>["param"];
export type BulkUpdateTaskRequest = InferRequestType<
	typeof $tasksBulkPut
>["json"];
export type DeleteTaskRequest = InferRequestType<typeof $tasksDelete>["param"];
export type Task = TodoWithTasks["tasks"][number];

export const createTask = async ({ ...data }: CreateTaskRequest) => {
	const res = await $tasksPost({
		param: { todoId: data.todoId },
		json: data,
	});

	if (!res.ok) throw new Error("Failed to create task");
	return res.json();
};

export const updateTask = async ({ taskId, ...data }: UpdateTaskRequest) => {
	const res = await $tasksPut({
		param: { todoId: data.todoId, taskId },
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
		param: { todoId: id },
		json: data.json,
	});

	if (!res.ok) throw new Error("Failed to update tasks");

	return res.json();
};

export const deleteTask = async ({ todoId, taskId }: DeleteTaskRequest) => {
	const res = await $tasksDelete({
		param: { todoId, taskId },
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

			const optimisticTask = {
				id: crypto.randomUUID(),
				name: newTask.name,
				completed: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				parentTaskId: newTask.parentTaskId ?? null,
				todoListId: todoId,
				children: [],
			};

			const insertTask = (
				tasks: TodoWithTasks["tasks"],
				parentId: string,
			): TodoWithTasks["tasks"] => {
				return tasks.map((task) => {
					if (task.id === parentId) {
						return {
							...task,
							children: [...task.children, optimisticTask],
						};
					}
					if (task.children.length > 0) {
						return {
							...task,
							children: insertTask(task.children, parentId),
						};
					}
					return task;
				});
			};

			const updatedTasks = optimisticTask.parentTaskId
				? insertTask(previousTodo.tasks, optimisticTask.parentTaskId)
				: [...previousTodo.tasks, optimisticTask];

			queryClient.setQueryData<TodoWithTasks>(["todo", todoId], {
				...previousTodo,
				tasks: updatedTasks,
			});

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

export const useEditTaskMutation = (todoId: string) =>
	useMutation({
		mutationFn: updateTask,

		onMutate: async (newTask) => {
			if (!todoId) throw new Error("Missing todoId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoId,
			]);
			if (!previousTodo) throw new Error("No previous todo found");

			const now = new Date().toISOString();

			const updateTask = (
				tasks: TodoWithTasks["tasks"],
				id: string,
				updater: (task: Task) => Task,
			): TodoWithTasks["tasks"] => {
				return tasks.map((task) => {
					if (task.id === id) {
						return updater(task);
					}

					const updatedChildren = updateTask(task.children ?? [], id, updater);
					if (updatedChildren !== task.children) {
						return { ...task, children: updatedChildren };
					}

					return task;
				});
			};

			const optimisticTodo = {
				...previousTodo,
				tasks: updateTask(previousTodo.tasks, newTask.taskId, (task) => ({
					...task,
					name: newTask.name ?? task.name,
					parentTaskId: newTask.parentTaskId ?? task.parentTaskId,
					completed: newTask.completed ?? task.completed,
					updatedAt: now,
				})),
			};

			queryClient.setQueryData(["todo", todoId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _newTask, context) => {
			if (context?.previousTodo) {
				queryClient.setQueryData(["todo", todoId], context.previousTodo);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
		},
	});

export const useBulkEditTasksMutation = (todoId: string) =>
	useMutation({
		mutationFn: (edits: BulkUpdateTaskRequest) => {
			if (!todoId) throw new Error("Missing todoId");
			return bulkUpdateTasks({ id: todoId, json: edits });
		},

		onMutate: async (edits) => {
			if (!todoId) throw new Error("Missing todoId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoId,
			]);

			if (!previousTodo) throw new Error("No previous todo found");

			const now = new Date().toISOString();

			// Create a map for quick lookup of edits by id
			const editsMap = new Map(edits.map((e) => [e.id, e]));

			const updateTasks = (
				tasks: TodoWithTasks["tasks"],
			): TodoWithTasks["tasks"] =>
				tasks.map((task) => {
					const edit = editsMap.get(task.id);
					const updatedChildren = updateTasks(task.children || []);

					if (edit) {
						return {
							...task,
							name: edit.name ?? task.name,
							completed: edit.completed ?? task.completed,
							parentTaskId: edit.parentTaskId ?? task.parentTaskId,
							updatedAt: now,
							children: updatedChildren,
						};
					}

					if (updatedChildren !== task.children) {
						return { ...task, children: updatedChildren };
					}

					return task;
				});

			const optimisticTodo = {
				...previousTodo,
				tasks: updateTasks(previousTodo.tasks),
			};

			queryClient.setQueryData(["todo", todoId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _edits, context) => {
			if (context?.previousTodo) {
				queryClient.setQueryData(["todo", todoId], context.previousTodo);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

export const useDeleteTaskMutation = (todoId: string) =>
	useMutation({
		mutationFn: deleteTask,

		onMutate: async (deleted) => {
			if (!todoId) throw new Error("Missing todoId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoId,
			]);

			if (!previousTodo) throw new Error("No previous todo found");

			const removeTask = (
				tasks: TodoWithTasks["tasks"],
				id: string,
			): TodoWithTasks["tasks"] => {
				return tasks
					.filter((task) => task.id !== id)
					.map((task) => ({
						...task,
						children: removeTask(task.children ?? [], id),
					}));
			};

			const optimisticTodo = {
				...previousTodo,
				tasks: removeTask(previousTodo.tasks, deleted.taskId),
			};

			queryClient.setQueryData(["todo", todoId], optimisticTodo);

			return { previousTodo };
		},

		onError: (_err, _deleted, context) => {
			if (context?.previousTodo) {
				queryClient.setQueryData(["todo", todoId], context.previousTodo);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
