import { baseUrl } from "@/lib/env";
import type { AppType } from "server";
import { hc } from "hono/client";

export const client = hc<AppType>(baseUrl, {
	init: {
		credentials: "include",
	},
});
