import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const Route = createRootRoute({
  component: () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      authClient.signIn
        .anonymous()
        .then(() => setLoading(false))
        .catch((err) => {
          console.error("Anonymous sign-in failed:", err);
          setError("Failed to sign in");
          setLoading(false);
        });
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950">
          <span className="text-white">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
