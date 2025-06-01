import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { anonymousAuthQueryOptions } from "@/lib/auth";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    loader: ({ context }) =>
      context.queryClient.ensureQueryData(anonymousAuthQueryOptions()),
    component: () => {
      return (
        <>
          <Outlet />
          <TanStackRouterDevtools />
        </>
      );
    },
  }
);
