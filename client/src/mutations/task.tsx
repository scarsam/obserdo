import {
	createTask,
	deleteTask,
	editTask,
	editTasksBulk,
	type BulkEditTask,
	type TodoWithTasks,
} from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import {
	updateTasksInCache,
	removeTaskFromCache,
} from "@/mutations/optimistic-updates";

export function useCreateTaskMutation(todoId: string) {
	return useMutation({
		mutationFn: createTask,
		onMutate: async (newTask) => {
			await queryClient.cancelQueries({ queryKey: ["todo", todoId] });

			const previousTodo = queryClient.getQueryData(["todo", todoId]);

			const optimisticTask = {
				id: Math.random().toString(),
				name: newTask.name,
				completed: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				parentTaskId: newTask.parentTaskId ?? null,
				todoListId: todoId,
				children: [],
			};

			queryClient.setQueryData(
				["todo", todoId],
				updateTasksInCache([optimisticTask]),
			);

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
}

export const useEditTaskMutation = (todoListId?: string) =>
	useMutation({
		mutationFn: editTask,
		onMutate: async (newTask) => {
			if (!todoListId) throw new Error("Missing todoListId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoListId,
			]);

			if (!previousTodo) {
				throw new Error("No previous todo found");
			}

			const updatedTask = {
				id: newTask.taskId,
				name: newTask.name ?? "",
				todoListId,
				parentTaskId: newTask.parentTaskId ?? null,
				completed: newTask.completed ?? false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				children: [],
			};

			queryClient.setQueryData<TodoWithTasks>(
				["todo", todoListId],
				updateTasksInCache([updatedTask]),
			);

			return { previousTodo };
		},
		onError: (_err, _newTask, context) => {
			if (context?.previousTodo) {
				queryClient.setQueryData(["todo", todoListId], context.previousTodo);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todo", todoListId] });
		},
	});

export const useEditTasksBulkMutation = (todoListId?: string) =>
	useMutation({
		mutationFn: (edits: BulkEditTask[]) => {
			if (!todoListId) throw new Error("Missing todoListId");
			return editTasksBulk(todoListId, edits);
		},
		onMutate: async (edits) => {
			if (!todoListId) throw new Error("Missing todoListId");

			await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoListId,
			]);

			if (!previousTodo) {
				throw new Error("No previous todo found");
			}

			const tasksToUpdate = edits
				.filter((edit): edit is BulkEditTask & { id: string } =>
					Boolean(edit.id),
				)
				.map((edit) => ({
					id: edit.id,
					name: edit.name ?? "",
					todoListId,
					parentTaskId: edit.parentTaskId ?? null,
					completed: edit.completed ?? false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					children: [],
				}));

			queryClient.setQueryData<TodoWithTasks>(
				["todo", todoListId],
				updateTasksInCache(tasksToUpdate),
			);

			return { previousTodo };
		},
		onError: (
			_err,
			_edits: BulkEditTask[],
			context: { previousTodo: TodoWithTasks } | undefined,
		) => {
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

export const useDeleteTaskMutation = (todoListId?: string) => {
	return useMutation({
		mutationFn: deleteTask,
		onMutate: async (newTask) => {
			if (!todoListId) throw new Error("Missing todoListId");

			await queryClient.cancelQueries({
				queryKey: ["todo", todoListId],
			});

			const previousTodo = queryClient.getQueryData<TodoWithTasks>([
				"todo",
				todoListId,
			]);

			if (!previousTodo) {
				throw new Error("No previous todo found");
			}

			queryClient.setQueryData<TodoWithTasks>(
				["todo", todoListId],
				removeTaskFromCache(newTask.taskId),
			);

			return { previousTodo };
		},
		onError: (_err, _taskId, context) => {
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
};
