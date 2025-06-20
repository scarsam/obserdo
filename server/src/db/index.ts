import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema.js";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true,
});

export const db = drizzle(pool, { schema });
