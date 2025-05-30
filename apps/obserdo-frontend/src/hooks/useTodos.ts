import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTodoList, createTodo } from "@/api/todos";

// Queries
export function useTodos() {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodoList });
}

// Mutations
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate and refetch todos after mutation
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
