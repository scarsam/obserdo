import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({ autoCodeSplitting: true }),
		viteReact(),
		tailwindcss(),
	],

	resolve: {
		alias: {
			"@client": path.resolve(__dirname, "./src"),
			"@server": path.resolve(__dirname, "../server/src"),
			"@shared": path.resolve(__dirname, "../shared/src"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
