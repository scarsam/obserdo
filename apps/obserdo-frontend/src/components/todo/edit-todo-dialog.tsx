import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { EditTodoForm } from "./edit-todo-form";
import { Pencil } from "lucide-react";
import type { Todo } from "@/api/todos";

export function EditTodoDialog({ todo }: { todo: Todo }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit TODO-{todo.id}</DialogTitle>
          <DialogDescription>
            Fill in the fields and save to update the todo item.
          </DialogDescription>
        </DialogHeader>

        <EditTodoForm
          todo={todo}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
