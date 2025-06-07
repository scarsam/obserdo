import {
  createTask,
  deleteTask,
  editTask,
  editTasksBulk,
  type BulkEditTask,
  type EditTask,
  type Task,
  type TodoWithTasks,
} from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export function useCreateTaskMutation(todoId: string) {
  return useMutation({
    mutationFn: createTask,

    // Optimistically update the cache
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

      queryClient.setQueryData(["todo", todoId], (old: TodoWithTasks) => {
        if (!old) return old;

        function insertSubtask(tasks: Task[]): Task[] {
          return tasks.map((task) => {
            if (task.id === newTask.parentTaskId) {
              return {
                ...task,
                children: [...task.children, optimisticTask],
              };
            }

            if (task.children.length > 0) {
              const updatedChildren = insertSubtask(task.children);
              // Only return a new object if children changed
              if (updatedChildren !== task.children) {
                return {
                  ...task,
                  children: updatedChildren,
                };
              }
            }

            return task; // return original object if unchanged
          });
        }

        if (newTask.parentTaskId) {
          return {
            ...old,
            tasks: insertSubtask(old.tasks),
          };
        }

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
        queryClient.setQueryData(["todo", todoId], context.previousTodo);
      }
    },

    // Invalidate to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
    },
  });
}
export const useEditTaskMutation = (todoListId?: string) =>
  useMutation({
    mutationFn: editTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

      const previousTodo = queryClient.getQueryData(["todo", todoListId]);

      const updateTaskById = (
        tasks: Task[],
        id: string,
        updater: (task: Task) => Task
      ): Task[] => {
        return tasks.map((task) => {
          if (task.id === id) {
            return updater(task);
          }

          if (task.children?.length) {
            const updatedChildren = updateTaskById(task.children, id, updater);
            if (updatedChildren !== task.children) {
              return { ...task, children: updatedChildren };
            }
          }

          return task;
        });
      };

      queryClient.setQueryData(["todo", todoListId], (old: TodoWithTasks) => {
        if (!old) return old;

        return {
          ...old,
          tasks: updateTaskById(old.tasks, newTask.taskId, (task) => ({
            ...task,
            name: newTask.name ?? task.name,
            completed: newTask.completed ?? task.completed,
            updatedAt: new Date().toISOString(),
          })),
        };
      });

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
      await queryClient.cancelQueries({ queryKey: ["todo", todoListId] });

      const previousTodo = queryClient.getQueryData<TodoWithTasks>([
        "todo",
        todoListId,
      ]);

      const updateTasks = (tasks: Task[]): Task[] =>
        tasks.map((task) => {
          const edit = edits.find((e) => e.id === task.id);
          let updated = { ...task };

          if (edit) {
            updated = {
              ...updated,
              completed: edit.completed ?? task.completed,
              name: edit.name ?? task.name,
              updatedAt: new Date().toISOString(),
            };
          }

          if (task.children?.length) {
            updated.children = updateTasks(task.children);
          }

          return updated;
        });

      queryClient.setQueryData<TodoWithTasks>(["todo", todoListId], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: updateTasks(old.tasks),
        };
      });

      return { previousTodo };
    },

    onError: (_err, _edits, context) => {
      if (context?.previousTodo) {
        queryClient.setQueryData(["todo", todoListId], context.previousTodo);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", todoListId] });
    },
  });

export const useDeleteTaskMutation = (todoListId?: string) => {
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (newTask) => {
      if (!todoListId) return;

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
            idToRemove: string
          ): Task[] => {
            return tasks
              .filter((task) => task.id !== idToRemove)
              .filter(
                (task) => task.parentTaskId !== idToRemove // remove sub-tasks if desired
              );
          };

          return {
            ...old,
            tasks: removeTaskAndSubtasks(old.tasks, newTask.taskId),
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
