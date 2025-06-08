import type { ColumnDef } from "@tanstack/react-table";
import type { Task } from "@/api/todos";

import { DataTableColumnHeader } from "../table/data-table-column-header";
import { TaskRowActions } from "./task-row-actions";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { useBulkEditTasksMutation } from "@/api/tasks";
import { TaskEditForm } from "./task-edit-form";
import { Dialog } from "../dialog";

export const taskColumns: ColumnDef<Task>[] = [
	{
		accessorKey: "name",
		header: ({ table }) => {
			const rowsToEdit = table.getRowModel().flatRows;

			const mutation = useBulkEditTasksMutation(
				rowsToEdit[0]?.original.todoListId,
			);

			return (
				<>
					<Checkbox
						className={cn(table.getIsSomeRowsSelected() && "border-blue-500")}
						checked={table.getIsAllRowsSelected()}
						onClick={table.getToggleAllRowsSelectedHandler()}
						onCheckedChange={(checked) => {
							const edits = rowsToEdit.map((r) => ({
								id: r.original.id,
								name: r.original.name,
								completed: !!checked,
								parentTaskId: r.original.parentTaskId,
							}));

							mutation.mutate(edits);
						}}
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
			);
		},
		cell: ({ row, getValue }) => {
			const mutation = useBulkEditTasksMutation(row.original.todoListId);

			return (
				<div
					style={{
						paddingLeft: `${row.depth * 2}rem`,
					}}
				>
					<div>
						<Checkbox
							className={cn(
								!row.original.completed &&
									row.getLeafRows().some((r) => r.original.completed) &&
									"border-blue-500",
							)}
							checked={row.original.completed}
							onCheckedChange={(checked) => {
								const rowsToEdit = [row, ...row.getLeafRows()];
								const edits = rowsToEdit.map((r) => ({
									id: r.original.id,
									name: r.original.name,
									completed: !!checked,
									parentTaskId: r.original.parentTaskId,
								}));

								mutation.mutate(edits);
							}}
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
						<Dialog
							dialogType="edit"
							openText={getValue<string>()}
							dialogTitle="Edit Task"
							dialogDescription="Edit the task and save to update."
						>
							<TaskEditForm row={row} />
						</Dialog>
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
		cell: ({ row }) => <TaskRowActions row={row} />,
	},
];
