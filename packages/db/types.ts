import type { InferSelectModel } from "drizzle-orm";
import { todos, user } from "./schema";

export type Todo = InferSelectModel<typeof todos>;
export type User = InferSelectModel<typeof user>;
