import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMutation } from "@tanstack/react-query";
import { createTodo } from "@/api/todos";
import { queryClient } from "@/lib/react-query";

const todoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

export const CreateTodoForm = () => {
  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onChange: todoSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ name: value.name, description: value.description });
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
                  New todo
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
        <form.Field
          name="description"
          children={(field) => {
            return (
              <>
                <Label
                  className="flex-col items-start mt-3"
                  htmlFor="description"
                >
                  Description (optional)
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-gray-800 text-gray-100"
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
      </form>
    </div>
  );
};
