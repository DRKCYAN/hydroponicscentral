import { WorkspaceSkeleton } from "@/components/ui/skeleton";

/** Route-transition fallback for every product screen (rail + strip persist). */
export default function ProductLoading() {
  return (
    <div role="status" aria-label="Loading">
      <WorkspaceSkeleton />
    </div>
  );
}
