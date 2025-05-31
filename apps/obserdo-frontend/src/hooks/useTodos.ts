import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTodoList, createTodo, createTask } from "@/api/todos";
import { queryClient } from "@/lib/react-query";

// Queries
export function useTodos() {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodoList });
}

// Mutations
export function useCreateTodo() {
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate and refetch todos after mutation
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch todos after mutation
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
