import { type PropsWithChildren, cloneElement, useState } from "react";
import { DialogButton, type DialogButtonType } from "./dialog-button";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Dialog as DialogUI,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DialogChildProps = {
	handleClose?: () => void;
};

export function Dialog({
	dialogType,
	children,
	dialogTitle,
	dialogDescription,
	openText,
	disabled,
}: PropsWithChildren<{
	dialogType: DialogButtonType;
	openText?: string;
	dialogTitle: string;
	dialogDescription: string;
	disabled?: boolean;
}>) {
	const [open, setOpen] = useState(false);

	return (
		<DialogUI open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild disabled={disabled}>
					<DialogTrigger asChild disabled={disabled}>
						<DialogButton
							className="px-0"
							type={dialogType}
							openText={openText}
						/>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>{dialogTitle}</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
					<DialogDescription>{dialogDescription}</DialogDescription>
				</DialogHeader>
				{cloneElement(children as React.ReactElement<DialogChildProps>, {
					handleClose: () => setOpen(false),
				})}
				<DialogClose className="absolute right-4 top-4" />
			</DialogContent>
		</DialogUI>
	);
}
