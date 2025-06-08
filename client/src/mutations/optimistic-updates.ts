import type { Task, TodoWithTasks } from "@/api/todos";

/**
 * Updates multiple tasks in the cache at once
 */
export const updateTasksInCache =
	(updatedTasks: Task[]) => (old: TodoWithTasks | undefined) => {
		if (!old) return old;

		// Helper function to recursively update tasks in the tree
		const updateTaskInTree = (tasks: Task[]): Task[] => {
			return tasks.map((task) => {
				const updatedTask = updatedTasks.find((t) => t.id === task.id);
				let result = { ...task };

				// Update task properties if an update exists
				if (updatedTask) {
					result = {
						...result,
						name: updatedTask.name ?? result.name,
						completed: updatedTask.completed ?? result.completed,
						updatedAt: new Date().toISOString(),
					};
				}

				// Recursively update children if they exist
				if (task.children?.length) {
					result.children = updateTaskInTree(task.children);
				}

				return result;
			});
		};

		return {
			...old,
			tasks: updateTaskInTree(old.tasks),
		};
	};

/**
 * Removes a task and all its subtasks from the cache
 */
export const removeTaskFromCache =
	(taskId: string) => (old: TodoWithTasks | undefined) => {
		if (!old) return old;

		// Helper function to recursively remove a task from the tree
		const removeTaskFromTree = (tasks: Task[]): Task[] => {
			return tasks
				.filter((task) => task.id !== taskId) // Remove the target task
				.map((task) => {
					// Recursively process children if they exist
					if (task.children?.length) {
						return {
							...task,
							children: removeTaskFromTree(task.children),
						};
					}
					return task;
				});
		};

		return {
			...old,
			tasks: removeTaskFromTree(old.tasks),
		};
	};
