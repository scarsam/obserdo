import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCreateTodoMutation } from "@/api/todos";

const todoSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
});

export const TodoCreateForm = ({
	handleClose,
}: {
	handleClose?: () => void;
}) => {
	const mutation = useCreateTodoMutation();

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		validators: {
			onMount: todoSchema,
			onChange: todoSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({ name: value.name, description: value.description });
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
								<Label className="flex-col items-start mt-3">
									New todo
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
				<form.Field
					name="description"
					children={(field) => {
						return (
							<>
								<Label className="flex-col items-start mt-3">
									Description (optional)
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
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
							{isSubmitting ? "..." : "Add Todo"}
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
