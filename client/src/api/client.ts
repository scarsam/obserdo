import { baseUrl } from "@/lib/env";
import { hc } from "hono/client";
import type { AppType } from "server";

export const client = hc<AppType>(baseUrl, {
	init: {
		credentials: "include",
	},
});
