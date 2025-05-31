import { baseUrl } from "@/lib/env";

import type { AppType } from "obserdo-backend/types";
import { hc, type InferRequestType } from "hono/client";

const client = hc<AppType>(baseUrl, {
  init: {
    credentials: "include",
  },
});

const $todosPost = client.api.todos.$post;
type CreateTodoTypes = InferRequestType<typeof $todosPost>["json"];

const $tasksPost = client.api.todos[":id"].tasks.$post;
type CreateTaskTypes = InferRequestType<typeof $tasksPost>["json"] &
  InferRequestType<typeof $tasksPost>["param"];

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

export async function createTask(newTask: CreateTaskTypes) {
  const res = await client.api.todos[":id"].tasks.$post({
    param: {
      id: newTask.id,
    },
    json: {
      name: newTask.name,
    },
  });

  if (!res.ok) throw new Error("Failed to create todo");

  return res.json();
}
