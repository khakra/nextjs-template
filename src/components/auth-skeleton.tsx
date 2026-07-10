import { Skeleton } from "@/components/ui/skeleton";

export function AuthSkeleton() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-2xl">
      <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-5 w-56" />
      </div>
      <div className="flex flex-col gap-4 px-4 sm:px-16">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="mx-auto mt-4 h-4 w-48" />
      </div>
      <Skeleton className="mx-auto mt-4 h-4 w-64 px-4 sm:px-16" />
    </div>
  );
}
