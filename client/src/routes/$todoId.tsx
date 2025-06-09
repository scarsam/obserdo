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
		const auth = await context.queryClient.ensureQueryData(
			anonymousAuthQueryOptions(),
		);
		context.queryClient.ensureQueryData(todoQueryOptions(todoId));
		return { user: auth?.user };
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
	const { cursors, sendCursorPosition } = useWebsocket(todoId, user?.id);

	const status = todoStatuses.find(
		(status) => status.value === todo.status,
	)?.label;

	const handleMouseMove = (e: React.MouseEvent) => {
		sendCursorPosition(e.clientX, e.clientY);
	};

	return (
		<div onMouseMove={handleMouseMove}>
			<section className="flex justify-between gap-4 my-12 items-center">
				<div className="flex flex-col gap-2 ">
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
				<div className="flex  items-center">
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

			<DataTable data={todo.tasks} columns={createTaskColumns(canEdit)}>
				{canEdit ? (
					<Dialog
						dialogType="create"
						openText="Create New Task"
						dialogTitle="Create New Task"
						dialogDescription="Fill in the fields and save to add a new task."
					>
						<TaskCreateForm todoId={todo.id} />
					</Dialog>
				) : (
					<p>You don't have permission to edit this list</p>
				)}
			</DataTable>

			{Object.entries(cursors).map(([otherUserId, pos]) => {
				if (otherUserId === user?.id) return null;
				return (
					<div
						key={otherUserId}
						style={{
							position: "absolute",
							left: pos.x,
							top: pos.y,
							width: 10,
							height: 10,
							backgroundColor: "red",
							borderRadius: "50%",
							pointerEvents: "none",
						}}
						title={`User ${otherUserId}`}
					/>
				);
			})}
		</div>
	);
}
