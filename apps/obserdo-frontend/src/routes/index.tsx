import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateTodo, useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  component: App,
});

const todosSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
});

function App() {
  const { data, isLoading, isError, error } = useTodos();
  const createTodoMutation = useCreateTodo();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onChange: todosSchema,
    },
    onSubmit: ({ value }) => {
      createTodoMutation.mutate({
        name: value.title,
        description: value.description,
      });
      form.reset();
    },
  });

  if (isLoading)
    return <p className="text-center py-10 text-gray-400">Loading...</p>;
  if (isError)
    return (
      <p className="text-center py-10 text-red-500">
        Error: {(error as Error).message}
      </p>
    );

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 rounded-lg shadow-md text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        My Todos
      </h1>

      {createTodoMutation.isPending && (
        <p className="mb-4 text-blue-400">Creating...</p>
      )}
      {createTodoMutation.isError && (
        <p className="mb-4 text-red-500">
          Error creating todo: {createTodoMutation.error?.message}
        </p>
      )}
      {createTodoMutation.isSuccess && (
        <p className="mb-4 text-green-400">Created successfully!</p>
      )}

      <ul className="mb-6 space-y-3">
        {data && data.length > 0 ? (
          data.map((todo) => (
            <li
              key={todo.id}
              className="p-4 bg-gray-800 rounded-md shadow-sm hover:bg-gray-700 transition"
            >
              <p className="font-semibold">{todo.name}</p>
              {todo.description && (
                <p className="text-gray-400 mt-1">{todo.description}</p>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-center">No todos yet.</p>
        )}
      </ul>

      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="title"
            children={(field) => {
              return (
                <>
                  <Label className="flex-col items-start mt-3" htmlFor="title">
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
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-4"
              >
                {isSubmitting ? "..." : "Add Todo"}
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}
