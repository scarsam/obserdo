import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCreateTaskMutation } from "@/api/tasks";
import type { Row } from "@tanstack/react-table";
import type { Task } from "@/api/todos";

const taskSchema = z.object({
	name: z.string().min(1, "Title is required"),
});

type TaskCreateFormProps =
	| { todoId: string; row?: never; handleClose?: () => void }
	| { todoId?: never; row: Row<Task>; handleClose?: () => void };

export const TaskCreateForm = ({
	todoId,
	row,
	handleClose,
}: TaskCreateFormProps) => {
	const id = row ? row.original.todoListId : todoId;
	const mutation = useCreateTaskMutation(id);

	const form = useForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onMount: taskSchema,
			onChange: taskSchema,
		},
		onSubmit: ({ value }) => {
			const newTask = {
				id: todoId ?? row.original.todoListId,
				name: value.name,
				parentTaskId: row?.original.id,
			};

			mutation.mutate(newTask);

			if (row?.getCanExpand()) {
				row.toggleExpanded(true);
			}

			form.reset();
			handleClose?.();
		},
	});

	return (
		<div className="space-y-4">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field
					name="name"
					children={(field) => {
						return (
							<>
								<Label className="flex-col items-start mt-3" htmlFor="name">
									Name
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										autoFocus
									/>
								</Label>
							</>
						);
					}}
				/>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit} className="w-full mt-4">
							{isSubmitting
								? "..."
								: row?.original.id
									? "Add Sub-task"
									: "Add Task"}
						</Button>
					)}
				/>

				{handleClose && (
					<Button
						variant="ghost"
						className="w-full mt-2"
						type="button"
						onClick={handleClose}
					>
						Cancel
					</Button>
				)}
			</form>
		</div>
	);
};
