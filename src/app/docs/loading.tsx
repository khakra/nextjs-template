import { Skeleton } from "@/components/ui/skeleton";

export default function DocsLoading() {
  return (
    <div className="max-w-4xl space-y-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-80 max-w-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
