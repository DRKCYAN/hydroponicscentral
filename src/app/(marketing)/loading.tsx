import { Skeleton } from "@/components/ui/skeleton";

/** Route-transition fallback for marketing pages (header + footer persist). */
export default function MarketingLoading() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-44 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
