import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateTodoForm } from "@/components/todo/create-todo-form"; // Your existing form component
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
} from "../ui/dialog";
import { Plus } from "lucide-react";

export function CreateTodoDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg">
          <Plus /> Add Todo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
          <DialogDescription>
            Fill in the fields and save to add a new todo.
          </DialogDescription>
        </DialogHeader>

        <CreateTodoForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
