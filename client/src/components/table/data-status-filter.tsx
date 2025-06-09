import { ListFilterPlus } from "lucide-react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { todoStatuses } from "./constants";

// biome-ignore lint/suspicious/noExplicitAny: requires some generic magic
export function StatusFilter({ column }: { column: any }) {
	const selectedValues: string[] = column.getFilterValue() ?? [];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm">
					Status
					<ListFilterPlus />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{todoStatuses.map((status) => (
					<DropdownMenuCheckboxItem
						key={status.value}
						checked={selectedValues.includes(status.value)}
						onCheckedChange={(checked) => {
							const newValues = checked
								? [...selectedValues, status.value]
								: selectedValues.filter((v) => v !== status.value);

							column.setFilterValue(newValues.length ? newValues : undefined);
						}}
					>
						{status.label}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
