import {
  createTask,
  deleteTask,
  editTask,
  type Task,
  type TodoWithTasks,
} from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export function useCreateTaskMutation(todoId: number) {
  return useMutation({
    mutationFn: createTask,

    // Optimistically update the cache
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["todo", `${todoId}`] });

      const previousTodo = queryClient.getQueryData(["todo", `${todoId}`]);

      console.log("newTask", newTask);

      const optimisticTask = {
        id: Math.random(), // temporary ID
        name: newTask.name,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentTaskId: newTask.parentTaskId ?? null,
      };

      queryClient.setQueryData(["todo", `${todoId}`], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          tasks: [...old.tasks, optimisticTask],
        };
      });

      return { previousTodo };
    },

    // Rollback on error
    onError: (_err, _newTask, context) => {
      if (context?.previousTodo) {
        queryClient.setQueryData(["todo", `${todoId}`], context.previousTodo);
      }
    },

    // Invalidate to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", `${todoId}`] });
    },
  });
}

export const useEditTaskMutation = (todoListId?: number) =>
  useMutation({
    mutationFn: editTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["todo", `${todoListId}`] });

      const previousTodo = queryClient.getQueryData(["todo", `${todoListId}`]);

      queryClient.setQueryData(
        ["todo", `${todoListId}`],
        (old: TodoWithTasks) => {
          if (!old) return old;

          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === Number(newTask.taskId)
                ? { ...task, completed: newTask.completed }
                : task
            ),
          };
        }
      );

      return { previousTodo };
    },

    onError: (_err, _newTask, context) => {
      if (context?.previousTodo) {
        queryClient.setQueryData(
          ["todo", `${todoListId}`],
          context.previousTodo
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", `${todoListId}`] });
    },
  });

export const useDeleteTaskMutation = (todoListId?: number) => {
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (newTask) => {
      // if (!todoListId) return;

      await queryClient.cancelQueries({
        queryKey: ["todo", `${todoListId}`],
      });

      const previousTodo = queryClient.getQueryData<TodoWithTasks>([
        "todo",
        `${todoListId}`,
      ]);

      queryClient.setQueryData<TodoWithTasks>(
        ["todo", `${todoListId}`],
        (old) => {
          if (!old) return old;

          // Optional: recursively remove sub-tasks
          const removeTaskAndSubtasks = (
            tasks: Task[],
            idToRemove: number
          ): Task[] => {
            return tasks
              .filter((task) => task.id !== idToRemove)
              .filter(
                (task) => task.parentTaskId !== idToRemove // remove sub-tasks if desired
              );
          };

          return {
            ...old,
            tasks: removeTaskAndSubtasks(old.tasks, Number(newTask.taskId)),
          };
        }
      );

      return { previousTodo };
    },

    onError: (_err, _taskId, context) => {
      if (todoListId && context?.previousTodo) {
        queryClient.setQueryData(
          ["todo", `${todoListId}`],
          context.previousTodo
        );
      }
    },

    onSettled: () => {
      if (todoListId) {
        queryClient.invalidateQueries({ queryKey: ["todo", `${todoListId}`] });
      }
    },
  });
};
