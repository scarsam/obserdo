import { createTodo, editTodo, type Todo } from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export const useCreateTodoMutation = () => useMutation({
  mutationFn: createTodo,
  onMutate: async (newTodo) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["todos"] });

    // Snapshot the previous value
    const previousTodos = queryClient.getQueryData(["todos"]);

    // Optimistically update to the new value
    queryClient.setQueryData(["todos"], (old: Todo[]) => {
      return [...(old || []), { ...newTodo, id: crypto.randomUUID() }];
    });

    // Return a context object with the snapshotted value
    return { previousTodos };
  },
  onError: (_err, _newTodo, context) => {
    // If the mutation fails, use the context returned from onMutate to roll back
    queryClient.setQueryData(["todos"], context?.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success to ensure data is in sync
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});


export const useEditTodoMutation = () =>
  useMutation({
    mutationFn: editTodo,
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["todos"], (old: Todo[]) => {
        return old?.map((todo) =>
          todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
        );
      });

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (_err, _newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["todos"], context?.previousTodos);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
