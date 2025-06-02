import { baseUrl } from "@/lib/env";
import { queryOptions } from "@tanstack/react-query";
import type { AppType } from "obserdo-backend/types";
import { hc, type InferRequestType, type InferResponseType } from "hono/client";

const client = hc<AppType>(baseUrl, {
  init: {
    credentials: "include",
  },
});

const $todosPost = client.api.todos.$post;
type CreateTodo = InferRequestType<typeof $todosPost>["json"];

const $todosPut = client.api.todos[":id"].$put;
type EditTodo = InferRequestType<typeof $todosPut>["json"] &
  InferRequestType<typeof $todosPut>["param"];

const $tasksPost = client.api.todos[":id"].tasks.$post;
type CreateTask = InferRequestType<typeof $tasksPost>["json"] &
  InferRequestType<typeof $tasksPost>["param"];

const $taskPut = client.api.todos[":id"].tasks[":taskId"].$put;
type EditTask = InferRequestType<typeof $taskPut>["json"] &
  InferRequestType<typeof $taskPut>["param"];

const $todoGet = client.api.todos[":id"].$get;
type TodoWithError = Exclude<InferResponseType<typeof $todoGet>, "error">;
type RemoveError<T> = T extends { error: string } ? never : T;
type TodoWithoutError = RemoveError<TodoWithError>;
export type Todo = Omit<TodoWithoutError, "tasks">;
export type Task = Pick<TodoWithoutError, "tasks">["tasks"][number];

export const todosQueryOptions = () =>
  queryOptions({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await client.api.todos.$get();

      if (!res.ok) throw new Error("Failed to fetch todos");

      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

export const todoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["todo", id],
    queryFn: async () => {
      const res = await client.api.todos[":id"].$get({
        param: {
          id,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch todos");

      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

export async function createTodo(newTodo: CreateTodo) {
  const res = await client.api.todos.$post({
    json: {
      name: newTodo.name,
      description: newTodo.description,
    },
  });

  if (!res.ok) throw new Error("Failed to create todo");

  return res.json();
}

export async function editTodo(newTask: EditTodo) {
  const res = await client.api.todos[":id"].$put({
    param: {
      id: newTask.id,
    },
    json: {
      name: newTask.name,
      description: newTask.description,
      status: newTask.status,
    },
  });

  if (!res.ok) throw new Error("Failed to create todo");

  return res.json();
}

export async function createTask(newTask: CreateTask) {
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

export async function editTask(editTask: EditTask) {
  const res = await client.api.todos[":id"].tasks[":taskId"].$put({
    param: {
      id: editTask.id,
      taskId: editTask.taskId,
    },
    json: {
      name: editTask.name,
      completed: editTask.completed,
    },
  });

  if (!res.ok) throw new Error("Failed to create todo");

  return res.json();
}
