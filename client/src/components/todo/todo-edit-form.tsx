import { type Todo, useEditTodoMutation } from "@/api/todos";
import { useForm } from "@tanstack/react-form";
import type { Row } from "@tanstack/react-table";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const todoSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
});

export const TodoEditForm = ({
	row,
	handleClose,
}: {
	row: Row<Todo>;
	handleClose?: () => void;
}) => {
	const mutation = useEditTodoMutation();

	const form = useForm({
		defaultValues: {
			name: row.original.name,
			description: row.original.description || "",
		},
		validators: {
			onChange: todoSchema,
		},

		onSubmit: ({ value }) => {
			mutation.mutate({
				id: row.original.id,
				name: value.name,
				description: value.description,
			});
			form.reset();
			handleClose?.();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field
				name="name"
				children={(field) => (
					<Label className="flex-col items-start mt-3">
						New name
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Todo name"
						/>
					</Label>
				)}
			/>
			<form.Field
				name="description"
				children={(field) => (
					<Label className="flex-col items-start mt-3">
						New description
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Description (optional)"
						/>
					</Label>
				)}
			/>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
				children={([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit} className="w-full mt-4">
						{isSubmitting ? "..." : "Update Todo"}
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
	);
};
