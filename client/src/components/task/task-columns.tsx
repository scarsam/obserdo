import type { Task } from "@/api/tasks";
import type { ColumnDef } from "@tanstack/react-table";

import { useBulkEditTasksMutation } from "@/api/tasks";
import { cn, timeAgo } from "@/lib/utils";
import {
	ChevronDown,
	ChevronRight,
	CornerRightDown,
	CornerUpLeft,
} from "lucide-react";
import { Dialog } from "../dialog";
import { DataTableColumnHeader } from "../table/data-table-column-header";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { TaskEditForm } from "./task-edit-form";
import { TaskRowActions } from "./task-row-actions";

export const createTaskColumns = (canEdit: boolean): ColumnDef<Task>[] => [
	{
		accessorKey: "name",
		header: ({ table }) => {
			const rowsToEdit = table.getRowModel().flatRows;

			const mutation = useBulkEditTasksMutation(
				rowsToEdit[0]?.original.todoListId,
			);

			return (
				<div className="flex items-center gap-3">
					<Checkbox
						disabled={!canEdit}
						className={cn(
							table.getIsSomeRowsSelected() && "border-blue-500",
							"border-gray-500",
						)}
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
					Name
					<Button
						variant="link"
						className="hover:cursor-pointer px-0!"
						size="sm"
						onClick={table.getToggleAllRowsExpandedHandler()}
						aria-label={
							table.getIsAllRowsExpanded() ? "Collapse row" : "Expand row"
						}
					>
						{table.getIsAllRowsExpanded() ? <ChevronDown /> : <ChevronRight />}
					</Button>
				</div>
			);
		},
		cell: ({ row, getValue }) => {
			const mutation = useBulkEditTasksMutation(row.original.todoListId);

			return (
				<div
					style={{
						paddingLeft: `${row.depth * 1.5}rem`,
					}}
				>
					<div className="flex items-center gap-3">
						<Checkbox
							disabled={!canEdit}
							className={cn(
								!row.original.completed &&
									row.getLeafRows().some((r) => r.original.completed) &&
									"border-blue-500",
								"border-gray-500",
							)}
							checked={row.original.completed}
							onCheckedChange={(checked) => {
								const rowsToEdit = [
									row,
									...row.getParentRows(),
									...row.getLeafRows(),
								];
								const edits = rowsToEdit.map((r) => ({
									id: r.original.id,
									name: r.original.name,
									completed: !!checked,
									parentTaskId: r.original.parentTaskId,
								}));

								mutation.mutate(edits);
							}}
						/>

						{canEdit ? (
							<Dialog
								dialogType="edit"
								openText={getValue<string>()}
								dialogTitle="Edit Task"
								dialogDescription="Edit the task and save to update."
							>
								<TaskEditForm row={row} />
							</Dialog>
						) : (
							<span>{getValue<string>()}</span>
						)}
						{row.getCanExpand() && (
							<Button
								variant="link"
								className="hover:cursor-pointer px-0!"
								size="sm"
								onClick={() => row.toggleExpanded()}
								aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
							>
								{row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
							</Button>
						)}
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
					{timeAgo(row.getValue("createdAt"))}
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
						{timeAgo(row.getValue("updatedAt"))}
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
		cell: ({ row }) => <TaskRowActions row={row} canEdit={canEdit} />,
	},
];
