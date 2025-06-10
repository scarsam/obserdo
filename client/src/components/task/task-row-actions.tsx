import { Trash2 } from "lucide-react";

import { useDeleteTaskMutation } from "@/api/tasks";
import type { Task } from "@/api/tasks";
import { Dialog } from "@/components/dialog";
import type { Row } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { TaskCreateForm } from "./task-create-form";

export function TaskRowActions({
	row,
	canEdit,
}: {
	row: Row<Task>;
	canEdit: boolean;
}) {
	const mutation = useDeleteTaskMutation(row.original.todoListId);

	return (
		<div className="flex">
			<Dialog
				disabled={!canEdit}
				dialogType="subTask"
				dialogTitle="Create New Sub-task"
				dialogDescription="Fill in the fields and save to add a new sub-task."
			>
				<TaskCreateForm row={row} />
			</Dialog>
			<Tooltip>
				<TooltipTrigger asChild disabled={!canEdit}>
					<Button
						size="lg"
						variant="ghost"
						onClick={() => {
							mutation.mutate({
								todoId: row.original.todoListId,
								taskId: row?.original.id,
							});
						}}
					>
						<Trash2 />
						<span className="sr-only">Delete</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Delete</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
