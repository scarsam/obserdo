import { useCreateTask } from "@/hooks/useTodos";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const taskSchema = z.object({
  name: z.string().min(1, "Title is required"),
});

export const CreateTaskForm = ({ id }: { id: number }) => {
  const createTaskMutation = useCreateTask();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: taskSchema,
    },
    onSubmit: ({ value }) => {
      createTaskMutation.mutate({
        id: `${id}`,
        name: value.name,
      });
      form.reset();
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
                    className="bg-gray-800 text-gray-100"
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
      </form>
    </div>
  );
};
