import { CirclePlus, Link, Pencil, Users } from "lucide-react";
import { Button } from "./ui/button";

export type DialogButtonType =
	| "create"
	| "subTask"
	| "edit"
	| "editWithIcon"
	| "share"
	| "permission";

const dialogButtons: Record<
	DialogButtonType,
	{
		variant: "link" | "ghost";
		size: "lg";
		icon?: React.ReactNode;
		openText?: string;
	}
> = {
	create: {
		variant: "link",
		size: "lg",
		icon: <CirclePlus />,
		openText: "Create Task",
	},
	subTask: { variant: "ghost", size: "lg", icon: <CirclePlus /> },
	edit: { variant: "link", size: "lg", openText: "Edit Task" },
	editWithIcon: { variant: "ghost", size: "lg", icon: <Pencil /> },
	share: { variant: "ghost", size: "lg", icon: <Link /> },
	permission: { variant: "ghost", size: "lg", icon: <Users /> },
};

export const DialogButton = ({
	type,
	openText,
	className,
	...props
}: {
	type: DialogButtonType;
	openText?: string;
	className?: string;
}) => {
	const { variant, size, icon } = dialogButtons[type];

	return (
		<Button variant={variant} size={size} className={className} {...props}>
			{icon}
			{openText || dialogButtons[type].openText}
		</Button>
	);
};

DialogButton.displayName = "DialogButton";
