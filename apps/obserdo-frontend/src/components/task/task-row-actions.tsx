import { Trash2 } from "lucide-react";

import { Button } from "../ui/button";
import { CreateTaskDialog } from "./create-task-dialog";
import { useDeleteTaskMutation } from "@/mutations/task";
import type { Task } from "@/api/todos";
import type { Table } from "@tanstack/react-table";

export function TaskRowActions({
  table,
  todoListId,
  parentTaskId,
}: {
  table: Table<Task>;
  todoListId: string;
  parentTaskId?: string;
}) {
  const mutation = useDeleteTaskMutation(todoListId);

  return (
    <div className="flex">
      <CreateTaskDialog
        table={table}
        todoListId={todoListId}
        parentTaskId={parentTaskId}
      />
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
