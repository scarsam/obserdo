import { CheckIcon, ClipboardIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function CopyButton({
	value,
	isLoading,
}: { value: string; isLoading: boolean }) {
	const [hasCopied, setHasCopied] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setHasCopied(false);
		}, 2000);
	}, []);

	return (
		<Button
			disabled={isLoading}
			type="button"
			className="w-full"
			onClick={() => {
				navigator.clipboard.writeText(value);
				setHasCopied(true);
			}}
		>
			<span className="sr-only">Copy</span>
			{isLoading ? (
				<Loader2Icon className="animate-spin" />
			) : hasCopied ? (
				<CheckIcon />
			) : (
				<ClipboardIcon />
			)}
			Copy link
		</Button>
	);
}
