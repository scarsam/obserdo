import { Trash2 } from "lucide-react";

import { Button } from "../ui/button";
import type { Todo } from "@/api/todos";
import { editTodoMutation } from "@/mutations/todo";
import { CreateTaskDialog } from "./create-task-dialog";

export function TaskRowActions({ todo }: { todo: Todo }) {
  const mutation = editTodoMutation();

  return (
    <div className="flex">
      <CreateTaskDialog todo={todo} subTask />
      <Button
        variant="ghost"
        onClick={() => {
          mutation.mutate({
            id: `${todo.id}`,
            name: todo.name,
            description: todo.description,
            status: "archived",
          });
        }}
      >
        <Trash2 />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
