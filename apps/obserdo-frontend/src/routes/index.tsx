import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateTodo, useTodos } from "@/hooks/useTodos";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { data, isLoading, isError, error } = useTodos();
  const createTodoMutation = useCreateTodo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading) return <span>Loading...</span>;
  if (isError) return <span>Error: {(error as Error).message}</span>;

  const handleCreate = () => {
    createTodoMutation.mutate({
      name: title,
      description: description ?? null,
    });
    setTitle("");
    setDescription("");
  };

  return (
    <div className="bg-black-950">
      {createTodoMutation.isPending && <p>Creating...</p>}
      {createTodoMutation.isError && (
        <p>Error creating todo: {createTodoMutation.error?.message}</p>
      )}
      {createTodoMutation.isSuccess && <p>Created!</p>}

      <ul>
        {data!.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New todo"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button
        onClick={handleCreate}
        disabled={createTodoMutation.isPending || title.trim() === ""}
      >
        Add Todo
      </button>
    </div>
  );
}
