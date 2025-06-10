import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function timeAgo(dateInput: string | Date): string {
	return formatDistanceToNow(new Date(dateInput), { addSuffix: true });
}

export function stringToColor(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	// Convert int hash to hex color
	let color = "#";
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 0xff;
		// Use brighter colors by ensuring min value
		color += `00${value.toString(16)}`.slice(-2);
	}
	return color;
}
