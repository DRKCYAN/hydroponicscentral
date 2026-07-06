/** Skeleton loaders. Data-heavy areas fade in through these rather than popping. */
import { Card } from "./primitives";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden />;
}

/** A card-shaped skeleton with a header row and a grid of stat placeholders. */
export function StatCardSkeleton({ stats = 4 }: { stats?: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div
        className="grid gap-4 p-5"
        style={{ gridTemplateColumns: `repeat(${stats}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: stats }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** A table skeleton for list-heavy screens. */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <div className="border-b border-neutral-200 px-5 py-3">
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-5 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 ${c === 0 ? "w-44" : "flex-1"}`} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Standard workspace page skeleton: header + a couple of content blocks. */
export function WorkspaceSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}
