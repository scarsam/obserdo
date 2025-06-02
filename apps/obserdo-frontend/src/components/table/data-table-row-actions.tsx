import { Archive, Pencil } from "lucide-react";

import { Button } from "../ui/button";
import { EditTodoDialog } from "../todo/edit-todo-dialog";
import type { Todo } from "@/api/todos";

export function DataTableRowActions({ todo }: { todo: Todo }) {
  return (
    <div className="flex">
      <EditTodoDialog todo={todo} />
      <Button variant="ghost">
        <Archive />
        <span className="sr-only">Open menu</span>
      </Button>
    </div>
  );
}
