import { createFileRoute } from "@tanstack/react-router";
import { todoQueryOptions } from "@/api/todos";
import { useSuspenseQuery } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { DataTable } from "@/components/table/data-table";
import { taskColumns } from "@/components/task/task-columns";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";

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
    <>
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        {todo.name}
      </h1>

      <li key={todo.id}>
        <p className="font-semibold">{todo.status}</p>
        <p className="font-semibold">{todo.name}</p>
        {todo.description && (
          <p className="text-gray-400 mt-1">{todo.description}</p>
        )}
      </li>
      {todo.tasks && todo.tasks.length > 0 ? (
        <DataTable data={todo.tasks} columns={taskColumns}>
          <CreateTaskDialog todo={todo} />
        </DataTable>
      ) : (
        <p className="text-gray-500 text-center">No tasks yet.</p>
      )}
    </>
  );
}
