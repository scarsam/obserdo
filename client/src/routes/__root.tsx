import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		component: () => {
			return (
				<div className="min-h-screen bg-gray-100 p-12">
					<div className="max-w-7xl m-auto">
						<div className="flex items-center mb-12">
							<div>
								<h1 className="text-4xl font-bold tracking-tight text-gray-900 pb-1">
									Obserdo
								</h1>
								<h2 className="text-muted-foreground text-lg">
									A collaborative task management app that helps you stay
									organized and on top of your tasks.
								</h2>
							</div>
						</div>
						<Outlet />
						<TanStackRouterDevtools />
					</div>
				</div>
			);
		},
	},
);
