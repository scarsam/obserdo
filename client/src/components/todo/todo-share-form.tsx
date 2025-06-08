import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useEditTodoMutation, type Todo } from "@/api/todos";
import type { Row } from "@tanstack/react-table";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { CopyButton } from "../clipboard-button";

const shareSchema = z.object({
	collaboratorPermission: z.union([z.literal("read"), z.literal("write")]),
});

export const TodoShareForm = ({
	row,
}: {
	row: Row<Todo>;
}) => {
	const mutation = useEditTodoMutation();

	const form = useForm({
		defaultValues: {
			collaboratorPermission: row.original.collaboratorPermission || "read",
		},
		validators: {
			onMount: shareSchema,
			onChange: shareSchema,
		},

		onSubmit: ({ value }) => {
			mutation.mutate({
				id: row.original.id,
				name: row.original.name,
				description: row.original.description,
				collaboratorPermission: value.collaboratorPermission,
			});
			form.reset();
		},
	});

	return (
		<form
			onChange={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field
				name="collaboratorPermission"
				children={(field) => {
					return (
						<>
							<Label className="flex-col items-start mt-3">
								Anyone with the link can
								<Select
									onValueChange={(e) =>
										field.handleChange(e as "read" | "write")
									}
									name={field.name}
									defaultValue={field.state.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={field.state.value} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="read">Viewer</SelectItem>
										<SelectItem value="write">Editor</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</>
					);
				}}
			/>
			<CopyButton
				value={`${window.location.origin}/${row.original.id}`}
				isLoading={mutation.isPending}
			/>
		</form>
	);
};
