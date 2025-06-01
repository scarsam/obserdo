import { createFileRoute } from "@tanstack/react-router";
import { CreateTodoForm } from "@/components/create-todo-form";
import { todosQueryOptions } from "@/api/todos";
import { useSuspenseQuery } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { DataTable } from "@/components/table/data-table";
import { columns } from "@/components/table/columns";

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
    <>
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        My Todos
      </h1>
      <CreateTodoForm />

      {todos && todos.length > 0 ? (
        <DataTable data={todos} columns={columns} />
      ) : (
        <p className="text-gray-500 text-center">No todos yet.</p>
      )}
    </>
  );
}
