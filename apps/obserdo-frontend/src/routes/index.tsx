import { createFileRoute } from "@tanstack/react-router";
import { useCreateTask, useCreateTodo, useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Label } from "@/components/ui/label";
import { CreateTodoForm } from "@/components/createTodo";
import { CreateTaskForm } from "@/components/createTask";

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
  const createTaskMutation = useCreateTask();

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
            <>
              <li
                key={todo.id}
                className="p-4 bg-gray-800 rounded-md shadow-sm hover:bg-gray-700 transition"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={todo.completed}
                />
                <p className="font-semibold">{todo.name}</p>
                {todo.description && (
                  <p className="text-gray-400 mt-1">{todo.description}</p>
                )}
                {todo.tasks && todo.tasks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {todo.tasks.map((task) => (
                      <>
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={task.completed}
                        />
                        <li
                          key={task.id}
                          className={`flex items-center ${
                            task.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.name}
                        </li>
                      </>
                    ))}
                  </ul>
                )}
              </li>
              <CreateTaskForm id={todo.id} />
            </>
          ))
        ) : (
          <p className="text-gray-500 text-center">No todos yet.</p>
        )}
      </ul>
      <CreateTodoForm />
    </div>
  );
}
