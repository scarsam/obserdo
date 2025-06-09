import { Archive, ListTodo } from "lucide-react";

import type { Todo } from "@/api/todos";
import { useEditTodoMutation } from "@/api/todos";
import type { Row } from "@tanstack/react-table";
import { Dialog } from "../dialog";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { TodoShareForm } from "./todo-share-form";

export function TodoRowActions({ row }: { row: Row<Todo> }) {
	const mutation = useEditTodoMutation();
	const isArchived = row.original.status === "archived";
	const isDone = row.original.status === "done";

	return (
		<div className="flex">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						disabled={isDone}
						variant="ghost"
						size="lg"
						onClick={() => {
							mutation.mutate({
								id: row.original.id,
								name: row.original.name,
								description: row.original.description,
								status: isArchived ? "todo" : "archived",
							});
						}}
					>
						{isArchived ? (
							<>
								<ListTodo />
								<span className="sr-only">Todo</span>
							</>
						) : (
							<>
								<Archive />
								<span className="sr-only">Archive</span>
							</>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{isArchived ? "Todo" : "Archive"}</p>
				</TooltipContent>
			</Tooltip>
			<Dialog
				dialogType="share"
				dialogTitle="Share todo"
				dialogDescription="Share and collaborate with others on this todo"
			>
				<TodoShareForm todo={row.original} />
			</Dialog>
		</div>
	);
}
