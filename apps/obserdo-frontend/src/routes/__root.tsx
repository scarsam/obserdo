import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    loader: ({ context }) =>
      context.queryClient.ensureQueryData(anonymousAuthQueryOptions()),
    component: () => {
      return (
        <div className="min-h-screen max-w-7xl m-auto">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back!
              </h2>
              <p className="text-muted-foreground">
                Here&apos;s a list of your tasks for this month!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <UserNav />
            </div>
          </div>
          <Outlet />
          <TanStackRouterDevtools />
        </div>
      );
    },
  }
);
