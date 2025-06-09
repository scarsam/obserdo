import type { Task } from "./types.js";

type TaskWithChildren = Task & {
	children: TaskWithChildren[];
};

export function buildTaskTree(tasks: Task[]): TaskWithChildren[] {
	const taskMap = new Map<string, TaskWithChildren>();
	const roots: TaskWithChildren[] = [];

	for (const task of tasks) {
		taskMap.set(task.id, { ...task, children: [] });
	}

	for (const task of tasks) {
		const current = taskMap.get(task.id);

		if (!current) continue;

		if (task.parentTaskId) {
			const parent = taskMap.get(task.parentTaskId);
			if (parent) {
				parent.children.push(current);
			}
		} else {
			roots.push(current);
		}
	}

	return roots;
}
