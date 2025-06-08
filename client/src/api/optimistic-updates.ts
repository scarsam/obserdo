import type { TaskWithChildren, TodoWithTasks } from "./todos";

// Updates multiple tasks in the cache at once
export const updateTasksInCache = (
	todo: TodoWithTasks,
	task: TaskWithChildren,
): TodoWithTasks => {
	const exists = todo.tasks.some((t) => t.id === task.id);
	return {
		...todo,
		tasks: exists
			? todo.tasks.map((t) =>
					t.id === task.id ? { ...t, ...task, children: t.children } : t,
				)
			: [...todo.tasks, task],
	};
};

// Removes a task and all its subtasks from the cache
export const removeTaskFromCache = (
	todo: TodoWithTasks,
	taskId: string,
): TodoWithTasks => ({
	...todo,
	tasks: todo.tasks.filter((t) => t.id !== taskId),
});

// Add a new task (root or subtask)
export const addTaskToCache = (
	todo: TodoWithTasks,
	task: TaskWithChildren,
): TodoWithTasks => ({
	...todo,
	tasks: [...todo.tasks, task],
});

// Update a task by id
export const updateTaskInCache = (
	todo: TodoWithTasks,
	task: TaskWithChildren,
): TodoWithTasks => ({
	...todo,
	tasks: todo.tasks.map((t) =>
		t.id === task.id ? { ...t, ...task, children: t.children } : t,
	),
});
