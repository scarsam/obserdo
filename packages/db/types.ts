import type { InferSelectModel } from "drizzle-orm";
import { todos } from "./schema";

export type Todo = InferSelectModel<typeof todos>;
