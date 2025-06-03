import { createFileRoute } from "@tanstack/react-router";
import { todosQueryOptions } from "@/api/todos";
import { useSuspenseQuery } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { DataTable } from "@/components/table/data-table";
import { todoColumns } from "@/components/todo/todo-columns";
import { CreateTodoDialog } from "@/components/todo/create-todo-dialog";

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
      <DataTable data={todos} columns={todoColumns}>
        <CreateTodoDialog />
      </DataTable>
    </>
  );
}
