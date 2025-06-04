import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "../table/data-table-column-header";
import { TaskRowActions } from "./task-row-actions";
import type { Task } from "@/api/todos";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { useEditTasksBulkMutation } from "@/mutations/task";

export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: ({ table }) => (
      <>
        <Checkbox
          className={cn(table.getIsSomeRowsSelected() && "border-blue-500")}
          checked={table.getIsAllRowsSelected()}
          onClick={table.getToggleAllRowsSelectedHandler()}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={table.getToggleAllRowsExpandedHandler()}
          aria-label={
            table.getIsAllRowsExpanded() ? "Collapse row" : "Expand row"
          }
        >
          {table.getIsAllRowsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        Name
      </>
    ),
    cell: ({ row, getValue, table }) => {
      const mutation = useEditTasksBulkMutation(row.original.todoListId);
      const selectedRows = table.getState().rowSelection;

      if (Object.keys(selectedRows).length > 0) {
        const selectedRows = table.getSelectedRowModel().flatRows.map((r) => ({
          id: r.original.id,
          name: r.original.name,
          completed: r.original.completed,
          parentTaskId: r.original.parentTaskId,
        }));
        mutation.mutate(selectedRows);
        //         name: string;
        // id?: string | undefined;
        // createdAt?: Date | undefined;
        // updatedAt?: Date | undefined;
        // parentTaskId?: string | null | undefined;
        // completed?: boolean | undefined;
      }

      return (
        <div
          style={{
            // Since rows are flattened by default,
            // we can use the row.depth property
            // and paddingLeft to visually indicate the depth
            // of the row
            paddingLeft: `${row.depth * 2}rem`,
          }}
        >
          <div>
            <Checkbox
              className={cn(
                row.subRows.length > 0 &&
                  row.getIsSomeSelected() &&
                  !row.getIsAllSubRowsSelected() &&
                  "border-blue-500"
              )}
              checked={
                row.getIsSomeSelected()
                  ? false
                  : row.subRows.length
                  ? row.getIsAllSubRowsSelected()
                  : row.getIsSelected()
              }
              onCheckedChange={row.getToggleSelectedHandler()}
              onClick={() =>
                console.log("click", table.getState().rowSelection)
              }
            />
            {row.getCanExpand() && (
              <Button
                variant="ghost"
                size="sm"
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
            {getValue<boolean>()}
          </div>
        </div>
      );
    },
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
