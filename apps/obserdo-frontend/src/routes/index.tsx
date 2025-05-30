import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateTodo, useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { data, isLoading, isError, error } = useTodos();
  const createTodoMutation = useCreateTodo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading)
    return <p className="text-center py-10 text-gray-400">Loading...</p>;
  if (isError)
    return (
      <p className="text-center py-10 text-red-500">
        Error: {(error as Error).message}
      </p>
    );

  const handleCreate = () => {
    createTodoMutation.mutate({
      name: title,
      description: description || null,
    });
    setTitle("");
    setDescription("");
  };

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
        <Input
          type="text"
          placeholder="New todo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 text-gray-100"
          autoFocus
        />
        <Input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-800 text-gray-100"
        />
        <Button
          onClick={handleCreate}
          disabled={createTodoMutation.isPending || title.trim() === ""}
          className="w-full"
        >
          Add Todo
        </Button>
      </div>
    </div>
  );
}
