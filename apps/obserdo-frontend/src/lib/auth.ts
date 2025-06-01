import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { baseUrl } from "./env";

import { queryOptions } from "@tanstack/react-query";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: baseUrl,
  plugins: [anonymousClient()],
});

export const anonymousAuthQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "anonymous"],
    queryFn: async () => {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        await authClient.signIn.anonymous();
      }

      return session;
    },
    staleTime: 1000 * 60 * 60, // 1 hour, or whatever makes sense
  });
