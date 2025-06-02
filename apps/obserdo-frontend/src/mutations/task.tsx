import { createTask, editTask } from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export const createTaskMutation = (id: number) =>
  useMutation({
    mutationFn: createTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["todo", `${id}`] }),
  });

export const editTaskMutation = (id?: number) =>
  useMutation({
    mutationFn: editTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["todo", `${id}`] }),
  });
