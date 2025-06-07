import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEditTaskMutation } from "@/mutations/task";
import type { Row } from "@tanstack/react-table";
import type { Task } from "@/api/todos";

const taskSchema = z.object({
  name: z.string().min(1, "Title is required"),
});

export const TaskEditForm = ({
  row,
  handleClose,
}: {
  row: Row<Task>;
  handleClose?: () => void;
}) => {
  const mutation = useEditTaskMutation(row.original.todoListId);

  const form = useForm({
    defaultValues: {
      name: row.original.name
    },
    validators: {
      onMount: taskSchema,
      onChange: taskSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        id: row.original.todoListId,
        taskId: row.original.id,
        name: value.name
      });

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
                  New name
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
                : "Edit task"}
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
