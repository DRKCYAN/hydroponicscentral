import { Skeleton, StatCardSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="mt-6">
        <StatCardSkeleton stats={4} />
      </div>
    </div>
  );
}
