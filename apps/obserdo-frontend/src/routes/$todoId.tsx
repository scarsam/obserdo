import { createFileRoute } from "@tanstack/react-router";
import { todoQueryOptions } from "@/api/todos";
import { CreateTaskForm } from "@/components/create-task-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";

export const Route = createFileRoute("/$todoId")({
  loader: async ({ context, params: { todoId } }) => {
    await context.queryClient.ensureQueryData(anonymousAuthQueryOptions());
    context.queryClient.ensureQueryData(todoQueryOptions(todoId));
  },
  pendingComponent: () => <p>Loading...</p>,
  errorComponent: () => <p>Error loading todo.</p>,
  component: App,
});

function App() {
  const { todoId } = Route.useParams();
  const { data: todo } = useSuspenseQuery(todoQueryOptions(todoId));

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 rounded-lg shadow-md text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        {todo.name}
      </h1>

      <li
        key={todo.id}
        className="p-4 bg-gray-800 rounded-md shadow-sm hover:bg-gray-700 transition"
      >
        <input type="checkbox" className="mr-2" checked={todo.completed} />
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
        <CreateTaskForm id={todo.id} />
      </li>
    </div>
  );
}
