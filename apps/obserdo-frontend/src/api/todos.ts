import { baseUrl } from "@/lib/env";

import type { AppType } from "obserdo-backend/types";
import { hc, type InferRequestType } from "hono/client";

const client = hc<AppType>(baseUrl, {
  init: {
    credentials: "include",
  },
});

const $post = client.api.todos.$post;
type CreateTodoTypes = InferRequestType<typeof $post>["json"];

export async function fetchTodoList() {
  const res = await client.api.todos.$get();

  if (!res.ok) throw new Error("Failed to fetch todos");

  return res.json();
}

export async function createTodo(newTodo: CreateTodoTypes) {
  const res = await client.api.todos.$post({
    json: {
      name: newTodo.name,
      description: newTodo.description,
    },
  });

  if (!res.ok) throw new Error("Failed to create todo");

  return res.json();
}
