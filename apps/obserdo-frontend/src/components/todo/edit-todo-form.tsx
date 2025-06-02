import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { editTodo, type Todo } from "@/api/todos";
import { queryClient } from "@/lib/react-query";

const todoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

export function EditTodoForm({
  todo,
  onSuccess,
  onCancel,
}: {
  todo: Todo;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const mutation = useMutation({
    mutationFn: editTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      name: todo.name,
      description: todo.description || "",
    },
    validators: {
      onChange: todoSchema,
    },

    onSubmit: ({ value }) => {
      mutation.mutate({
        id: `${todo.id}`,
        name: value.name,
        description: value.description,
      });
      form.reset();
      onSuccess?.();
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
          <Input
            id={field.name}
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Todo name"
          />
        )}
      />
      <form.Field
        name="description"
        children={(field) => (
          <Input
            id={field.name}
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Description (optional)"
          />
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

      {onCancel && (
        <Button
          variant="ghost"
          className="w-full mt-2"
          type="button"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
      )}
    </form>
  );
}
