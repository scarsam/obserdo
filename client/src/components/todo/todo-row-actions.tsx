import { Archive } from "lucide-react";

import { Button } from "../ui/button";
import type { Todo } from "@/api/todos";
import { useEditTodoMutation } from "@/api/todos";
import { Dialog } from "../dialog";
import { TodoEditForm } from "./todo-edit-form";
import type { Row } from "@tanstack/react-table";
import { TodoShareForm } from "./todo-share-form";

export function TodoRowActions({ row }: { row: Row<Todo> }) {
	const mutation = useEditTodoMutation();

	return (
		<div className="flex">
			<Dialog
				dialogType="editWithIcon"
				dialogTitle={`Edit TODO-${row.index + 1}`}
				dialogDescription="Edit the todo item and save to update."
			>
				<TodoEditForm row={row} />
			</Dialog>
			<Button
				variant="ghost"
				size="lg"
				onClick={() => {
					mutation.mutate({
						id: row.original.id,
						name: row.original.name,
						description: row.original.description,
						status: "archived",
					});
				}}
			>
				<Archive />
				<span className="sr-only">Archive</span>
			</Button>
			<Dialog
				dialogType="share"
				dialogTitle="Share todo"
				dialogDescription="Share and collaborate with others on this todo"
			>
				<TodoShareForm row={row} />
			</Dialog>
		</div>
	);
}
