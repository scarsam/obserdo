import { baseUrl } from "@/lib/env";
import { hc } from "hono/client";
import type { AppType } from "server";

export const client = hc<AppType>(baseUrl, {
	init: {
		credentials: "include",
	},
});

export const wsClient = hc<AppType>(baseUrl, {
	init: {
		credentials: "include",
	},
});
