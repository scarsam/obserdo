import { createFileRoute, Link } from "@tanstack/react-router";
import { CreateTodoForm } from "@/components/createTodo";
import { todosQueryOptions } from "@/api/todos";
import { useSuspenseQuery } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(anonymousAuthQueryOptions());
    return context.queryClient.ensureQueryData(todosQueryOptions());
  },
  pendingComponent: () => <p>Loading...</p>,
  errorComponent: () => <p>Error loading todos.</p>,
  component: App,
});

function App() {
  const { data: todos } = useSuspenseQuery(todosQueryOptions());

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 rounded-lg shadow-md text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        My Todos
      </h1>

      <ul className="mb-6 space-y-3">
        {todos && todos.length > 0 ? (
          todos.map((todo) => (
            <>
              <li
                key={todo.id}
                className="p-4 bg-gray-800 rounded-md shadow-sm hover:bg-gray-700 transition"
              >
                <Link to="/$todoId" params={{ todoId: `${todo.id}` }}>
                  {todo.id}
                </Link>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={todo.completed}
                />
                <p className="font-semibold">{todo.name}</p>
                {todo.description && (
                  <p className="text-gray-400 mt-1">{todo.description}</p>
                )}
              </li>
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
