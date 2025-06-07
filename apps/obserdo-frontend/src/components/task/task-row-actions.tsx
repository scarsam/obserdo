import { Trash2 } from "lucide-react";

import { Button } from "../ui/button";
import { useDeleteTaskMutation } from "@/mutations/task";
import type { Task } from "@/api/todos";
import type { Row } from "@tanstack/react-table";
import { Dialog } from "@/components/dialog";
import { TaskCreateForm } from "./task-create-form";

export function TaskRowActions({
  row,
}: {
  row: Row<Task>;
}) {
  const mutation = useDeleteTaskMutation(row.original.todoListId);

  return (
    <div className="flex">
      <Dialog
        dialogType="subTask"
        dialogTitle="Create New Sub-task"
        dialogDescription="Fill in the fields and save to add a new sub-task."
      >
        <TaskCreateForm row={row} />
      </Dialog>

      <Button
        variant="ghost"
        onClick={() => {
          mutation.mutate({
            id: row.original.todoListId,
            taskId: row?.original.id
          });
        }}
      >
        <Trash2 />
        <span className="sr-only">Delete</span>
      </Button>
    </div >
  );
}
