import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useMutation } from "@tanstack/react-query";
import { editTodo, type Todo } from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

const todoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  completed: z.boolean(),
});

export const EditTodoForm = ({
  todo: { id, name, description, completed },
}: {
  todo: Todo;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const mutation = useMutation({
    mutationFn: editTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const form = useForm({
    defaultValues: {
      name,
      description: description || "",
      completed,
    },
    validators: {
      onChange: todoSchema,
    },
  });

  const saveChanges = () => {
    mutation.mutate({
      id: `${id}`,
      name: form.getFieldValue("name").trim(),
      description: form.getFieldValue("description").trim(),
      completed: form.getFieldValue("completed"),
    });
  };

  return (
    <Card className="max-w-md mx-auto cursor-pointer hover:shadow-lg transition-shadow">
      <Link
        to={`/${id}`}
        className="block no-underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
      >
        <CardContent className="flex items-center gap-4">
          {/* Checkbox circle */}
          <form.Field
            name="completed"
            children={(field) => (
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  field.handleChange(newValue);
                  mutation.mutate({
                    id: `${id}`,
                    name: form.getFieldValue("name").trim(),
                    description: form.getFieldValue("description").trim(),
                    completed: newValue,
                  });
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  field.handleBlur();
                  e.stopPropagation();
                }}
                aria-label="Toggle completed"
              />
            )}
          />

          {/* Name and description stacked */}
          <div className="flex flex-col flex-grow">
            <form.Field
              name="name"
              children={(field) =>
                isEditing ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    autoFocus
                    onBlur={() => {
                      field.handleBlur();
                      saveChanges();
                    }}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Todo name"
                    className="text-lg font-semibold"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-900">
                    {field.state.value || "No name"}
                  </span>
                )
              }
            />
            <form.Field
              name="description"
              children={(field) =>
                isEditing ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={() => {
                      field.handleBlur();
                      saveChanges();
                    }}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Description (optional)"
                    className="text-sm text-gray-600 mt-1"
                  />
                ) : (
                  <span className="text-sm text-gray-500 mt-1 truncate">
                    {field.state.value || "No description"}
                  </span>
                )
              }
            />
          </div>
        </CardContent>
      </Link>

      {/* Footer with edit toggle */}
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isEditing) saveChanges();
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      </CardFooter>
    </Card>
  );
};
