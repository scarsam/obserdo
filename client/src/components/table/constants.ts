import { CheckCircle, Circle, CircleOff, Timer } from "lucide-react";

export const todoStatuses = [
	{
		value: "todo",
		label: "Todo",
		icon: Circle,
	},
	{
		value: "in-progress",
		label: "In Progress",
		icon: Timer,
	},
	{
		value: "done",
		label: "Done",
		icon: CheckCircle,
	},
	{
		value: "archived",
		label: "Archived",
		icon: CircleOff,
	},
] as const;
