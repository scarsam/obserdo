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
import type { Todo } from "@/api/todos";

export function CreateTaskDialog({
  todo,
  subTask,
}: {
  todo: Todo;
  subTask?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg">
          <CirclePlus /> {!subTask && "Add Task"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {subTask ? "Create New Sub-task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            Fill in the fields and save to add{" "}
            {subTask ? "a new sub-task." : "a new task."}
          </DialogDescription>
        </DialogHeader>

        <CreateTaskForm
          subTask={subTask}
          todo={todo}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
