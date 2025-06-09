import type { ColumnDef } from "@tanstack/react-table";

import type { Todo } from "@/api/todos";
import { timeAgo } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Dialog } from "../dialog";
import { todoStatuses } from "../table/constants";
import { StatusFilter } from "../table/data-status-filter";
import { DataTableColumnHeader } from "../table/data-table-column-header";
import { TodoEditForm } from "./todo-edit-form";
import { TodoRowActions } from "./todo-row-actions";

export const todoColumns: ColumnDef<Todo>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="ID" />
		),
		cell: ({ row }) => {
			const id = row.original.id;
			return (
				<Link
					to="/$todoId"
					params={{ todoId: `${id}` }}
					className="hover:underline text-blue-600 font-medium"
				>
					<>TODO-{row.index + 1}</>
				</Link>
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
		cell: ({ row, getValue }) => (
			<div className="flex space-x-2">
				<span className="max-w-[500px] truncate font-medium">
					<Dialog
						dialogType="edit"
						openText={getValue<string>()}
						dialogTitle="Edit Todo"
						dialogDescription="Edit the todo and save to update."
					>
						<TodoEditForm row={row} />
					</Dialog>
				</span>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "description",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Description" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex space-x-2">
					<span className="max-w-[500px] truncate font-medium">
						{row.getValue("description")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<div className="flex items-center gap-2">
				{/* <DataTableColumnHeader column={column} title="Status" /> */}
				<StatusFilter column={column} />
			</div>
		),
		cell: ({ row }) => {
			const status = todoStatuses.find(
				(status) => status.value === row.getValue("status"),
			);

			if (!status) return "N/A";

			return (
				<div className="flex w-[120px] items-center">
					{status.icon && (
						<status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
					)}
					<span>{status.label}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableColumnFilter: true,
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
		cell: ({ row }) => <TodoRowActions row={row} />,
	},
];
