import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "../table/data-table-column-header";
import { TaskRowActions } from "./task-row-actions";
import type { Task } from "@/api/todos";
import { Checkbox } from "../ui/checkbox";
import { useEditTaskMutation } from "@/mutations/task";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export const taskColumns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => {
      const { id, name, todoListId, completed } = row.original;
      const mutation = useEditTaskMutation(todoListId);

      return (
        <Checkbox
          checked={completed}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            mutation.mutate({
              id: `${todoListId}`, // todo: clean these names up
              taskId: `${id}`,
              name: name,
              completed: !!value,
            });
          }}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.name,
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div
        style={{ paddingLeft: `${row.depth * 15}px` }}
        className="flex items-center"
      >
        {row.getCanExpand() && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 p-0"
            onClick={() => row.toggleExpanded()}
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <span>{row.original.name}</span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("createdAt")}
        </span>
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("updatedAt")}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row, table }) => (
      <TaskRowActions
        table={table}
        todoListId={row.original.todoListId}
        parentTaskId={row.original.id}
      />
    ),
  },
];
