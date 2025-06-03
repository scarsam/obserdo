import { Trash2 } from "lucide-react";

import { Button } from "../ui/button";
import { CreateTaskDialog } from "./create-task-dialog";
import { useDeleteTaskMutation } from "@/mutations/task";

export function TaskRowActions({
  todoListId,
  parentTaskId,
}: {
  todoListId: number;
  parentTaskId: number | null;
}) {
  const mutation = useDeleteTaskMutation(todoListId);

  return (
    <div className="flex">
      <CreateTaskDialog todoListId={todoListId} parentTaskId={parentTaskId} />
      <Button
        variant="ghost"
        onClick={() => {
          mutation.mutate({
            id: `${todoListId}`,
            taskId: `${parentTaskId}`,
          });
        }}
      >
        <Trash2 />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
