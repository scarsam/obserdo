import { createTask, editTask, type TodoWithTasks } from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export function useCreateTaskMutation(todoId: number) {
  return useMutation({
    mutationFn: createTask,

    // Optimistically update the cache
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["todo", `${todoId}`] });

      const previousTodo = queryClient.getQueryData(["todo", `${todoId}`]);

      const optimisticTask = {
        id: Math.random(), // temporary ID
        name: newTask.name,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
