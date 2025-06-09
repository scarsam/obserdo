import { Skeleton } from "@/components/ui/skeleton";

export const DataSkeleton = () => {
	return (
		<div className="space-y-4 w-full">
			{[...Array(8)].map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: index is ok for Skeleton generation
				<div key={i} className="flex gap-4 items-center px-2 py-2">
					<div className="w-12">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
					<div className="flex-1">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
					<div className="flex-1">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
					<div className="flex-1">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
					<div className="flex-1">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
					<div className="flex-1">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
					<div className="w-12">
						<Skeleton className="h-4 w-full bg-gray-300" />
					</div>
				</div>
			))}
		</div>
	);
};
