import { authClient } from "@/lib/auth";
import { useEffect, useState } from "react";

export function useAnonymousAuth() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function signInAnon() {
      try {
        let { data: session } = await authClient.getSession();

        if (!session?.user) {
          await authClient.signIn.anonymous();
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    signInAnon();
  }, []);

  return { isLoading };
}
