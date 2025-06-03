import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCreateTaskMutation } from "@/mutations/task";
import type { Todo } from "@/api/todos";

const taskSchema = z.object({
  name: z.string().min(1, "Title is required"),
});

export const CreateTaskForm = ({
  subTask,
  todo,
  onSuccess,
  onCancel,
}: {
  subTask?: boolean;
  todo: Todo;
  onSuccess?: () => void;
  onCancel?: () => void;
}) => {
  const mutation = useCreateTaskMutation(todo.id);

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onMount: taskSchema,
      onChange: taskSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ id: `${todo.id}`, name: value.name });
      form.reset();
      onSuccess?.();
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
                  New Task
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
              {isSubmitting ? "..." : "Add Task"}
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
    </div>
  );
};
