import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";
import type { Table } from "@tanstack/react-table";
import type { Task } from "@/api/todos";

export function CreateTaskDialog({
  table,
  todoListId,
  parentTaskId,
}: {
  table: Table<Task>;
  todoListId: number;
  parentTaskId?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg">
          <CirclePlus /> {!parentTaskId && "Add Task"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {parentTaskId ? "Create New Sub-task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            Fill in the fields and save to add{" "}
            {parentTaskId ? "a new sub-task." : "a new task."}
          </DialogDescription>
        </DialogHeader>

        <CreateTaskForm
          table={table}
          parentTaskId={parentTaskId}
          todoListId={todoListId}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
