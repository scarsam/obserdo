import { createFileRoute } from "@tanstack/react-router";
import { todoQueryOptions } from "@/api/todos";
import { useSuspenseQuery } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { DataTable } from "@/components/table/data-table";
import { taskColumns } from "@/components/task/task-columns";
import { TaskDialog } from "@/components/task/task-dialog";
import { TaskCreateForm } from "@/components/task/task-create-form";
import { Badge } from "@/components/ui/badge";

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
      <section className="flex justify-between gap-4 my-12 items-center border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-2 ">
          <h1 className="text-xl font-bold">
            {todo.name}
          </h1>
          {todo.description && (
            <p className="text-gray-400 mt-1">{todo.description}</p>
          )}
        </div>
        <Badge variant="outline">{todo.status}</Badge>
      </section>


      <DataTable data={todo.tasks} columns={taskColumns}>
        <TaskDialog
          dialogType="create"
          openText="Create New Task"
          dialogTitle="Create New Task"
          dialogDescription="Fill in the fields and save to add a new task."
        >
          <TaskCreateForm todoId={todo.id} />
        </TaskDialog>
      </DataTable>
    </>
  );
}
