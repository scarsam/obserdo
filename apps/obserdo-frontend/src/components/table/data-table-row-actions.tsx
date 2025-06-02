import { Archive } from "lucide-react";

import { Button } from "../ui/button";
import { EditTodoDialog } from "../todo/edit-todo-dialog";
import type { Todo } from "@/api/todos";
import { editTodoMutation } from "@/mutations/todo";

export function DataTableRowActions({ todo }: { todo: Todo }) {
  const mutation = editTodoMutation();

  return (
    <div className="flex">
      <EditTodoDialog todo={todo} />
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
        <Archive />
        <span className="sr-only">Open menu</span>
      </Button>
    </div>
  );
}
