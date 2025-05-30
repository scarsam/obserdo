import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useAnonymousAuth } from "@/hooks/useAuth";

export const Route = createRootRoute({
  component: () => {
    const { isLoading } = useAnonymousAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950">
          <span className="text-white">Loading...</span>
        </div>
      );
    }

    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  },
});
