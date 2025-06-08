import { cors } from "hono/cors";

export const corsMiddleware = cors({
	origin: [
		"http://localhost:3000",
		"http://localhost:3000/",
		"http://localhost:3001",
		"http://localhost:3001/",
		"https://obserdo.onrender.com",
	], // or "*" in dev if needed
	credentials: true,
});
