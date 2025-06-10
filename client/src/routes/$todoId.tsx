import { todoQueryOptions } from "@/api/todos";
import { Dialog } from "@/components/dialog";
import { todoStatuses } from "@/components/table/constants";
import { DataSkeleton } from "@/components/table/data-skeleton";
import { DataTable } from "@/components/table/data-table";
import { createTaskColumns } from "@/components/task/task-columns";
import { TaskCreateForm } from "@/components/task/task-create-form";
import { TodoShareForm } from "@/components/todo/todo-share-form";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useWebsocket } from "@/hooks/useWebsocket";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$todoId")({
	loader: async ({ context, params: { todoId } }) => {
		const data = await context.queryClient.ensureQueryData(
			anonymousAuthQueryOptions(),
		);

		return {
			user: data?.user,
			todo: context.queryClient.ensureQueryData(todoQueryOptions(todoId)),
		};
	},
	pendingComponent: () => <DataSkeleton />,
	pendingMinMs: 2000,
	errorComponent: () => <p>Error loading todo.</p>,
	component: App,
});

function App() {
	const { user } = Route.useLoaderData();
	const { todoId } = Route.useParams();
	const { data: todo } = useSuspenseQuery(todoQueryOptions(todoId));
	const isOwner = user?.id === todo.userId;
	const canEdit = isOwner || todo.collaboratorPermission === "write";
	const { sendCursorPosition } = useWebsocket(todoId, user?.id);

	const status = todoStatuses.find(
		(status) => status.value === todo.status,
	)?.label;

	const handleMouseMove = (e: React.MouseEvent) => {
		sendCursorPosition(e.clientX, e.clientY);
	};

	return (
		<div className="container mx-auto" onMouseMove={handleMouseMove}>
			<section className="flex justify-between gap-4 my-12 items-center">
				<div className="flex flex-col gap-2">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link to="/">Todos</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbPage>
								<p>{todo.name}</p>
							</BreadcrumbPage>
						</BreadcrumbList>
					</Breadcrumb>
					{todo.description && (
						<h2 className="text-gray-800 text-xl">
							Description: {todo.description}
						</h2>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Dialog
						dialogType="permission"
						dialogTitle="Change permission"
						dialogDescription="Change the permission of this todo"
					>
						<TodoShareForm todo={todo} />
					</Dialog>
					<Badge>{status}</Badge>
				</div>
			</section>

			<div className="flex flex-col gap-4">
				<DataTable columns={createTaskColumns(canEdit)} data={todo.tasks} />
				{canEdit ? (
					<Dialog
						dialogType="create"
						dialogTitle="Create task"
						dialogDescription="Create a new task for this todo"
					>
						<TaskCreateForm todoId={todo.id} />
					</Dialog>
				) : (
					<p className="text-center">
						You don't have permission to edit this list
					</p>
				)}
			</div>
		</div>
	);
}
