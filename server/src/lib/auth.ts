import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import { db } from "../db/index.js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	plugins: [anonymous()],
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
			domain: ".onrender.com", // This allows cookies to work across subdomains
		},
		defaultCookieAttributes: {
			secure: true,
			httpOnly: true,
			sameSite: "lax", // Change from "none" to "lax" for iOS compatibility
			// Remove partitioned: true - iOS doesn't handle this well
		},
	},
	trustedOrigins: [
		"https://obserdo.onrender.com",
		"https://obserdo-backend.onrender.com",
		"http://localhost:3000",
		"http://localhost:3000/",
		"http://localhost:3001",
		"http://localhost:3001/",
	],
});
