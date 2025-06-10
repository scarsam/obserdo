import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import { db } from "../db/index.js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	plugins: [anonymous()],
	// advanced: {
	// 	defaultCookieAttributes: {
	// 		secure: true,
	// 		httpOnly: true,
	// 		sameSite: "lax",
	// 		domain: "obserdo.onrender.com",
	// 	},
	// },
	trustedOrigins: [
		"https://obserdo.onrender.com",
		"https://obserdo-backend.onrender.com",
		"http://localhost:3000",
		"http://localhost:3001",
	],
});
