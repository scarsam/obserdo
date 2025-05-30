import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { anonymous } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [anonymous()],
  crossSubDomainCookies: {
    enabled: true,
    domain: ".onrender.com", // 👈 NOTE: leading dot required
  },
  defaultCookieAttributes: {
    secure: true,
    httpOnly: true,
    sameSite: "none", // Allows CORS-based cookie sharing across subdomains
    partitioned: true, // New browser standards will mandate this for foreign cookies
  },
  trustedOrigins: [
    "https://obserdo.onrender.com",
    "https://obserdo-backend.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
});
