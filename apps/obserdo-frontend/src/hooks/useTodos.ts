import { useMutation } from "@tanstack/react-query";
import { createTodo, createTask } from "@/api/todos";
import { useRouter } from "@tanstack/react-router";

// Mutations
export function useCreateTodo() {
  const router = useRouter();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => router.invalidate(),
  });
}

export function useCreateTask() {
  const router = useRouter();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => router.invalidate(),
  });
}
