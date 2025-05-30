import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: ["http://localhost:3000", "https://obserdo.onrender.com"], // or "*" in dev if needed
  credentials: true,
});
