import type { Todo } from "db/types";

export async function fetchTodoList(): Promise<Todo[]> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function createTodo(
  newTodo: Pick<Todo, "name" | "description">
): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}
