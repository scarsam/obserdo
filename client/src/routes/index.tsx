import { todosQueryOptions } from "@/api/todos";
import { Dialog } from "@/components/dialog";
import { DataSkeleton } from "@/components/table/data-skeleton";
import { DataTable } from "@/components/table/data-table";
import { todoColumns } from "@/components/todo/todo-columns";
import { TodoCreateForm } from "@/components/todo/todo-create-form";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(anonymousAuthQueryOptions());
		return context.queryClient.ensureQueryData(todosQueryOptions());
	},
	pendingComponent: () => <DataSkeleton />,
	pendingMinMs: 2000,
	errorComponent: () => <p>Error loading todos.</p>,
	component: App,
});

function App() {
	const { data: todos } = useSuspenseQuery(todosQueryOptions());

	return (
		<DataTable data={todos} columns={todoColumns}>
			<Dialog
				dialogType="create"
				openText="Create New Todo"
				dialogTitle="Create New Todo"
				dialogDescription="Fill in the fields and save to add a new todo."
			>
				<TodoCreateForm />
			</Dialog>
		</DataTable>
	);
}
