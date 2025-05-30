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
  trustedOrigins: [
    "https://obserdo.onrender.com",
    "https://obserdo-backend.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
});
