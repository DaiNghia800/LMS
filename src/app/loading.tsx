import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col gap-8 max-w-6xl mx-auto animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-3">
            <Skeleton className="h-10 w-64 bg-primary/10" />
            <Skeleton className="h-4 w-96 bg-muted" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full bg-muted" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-border bg-card/50 p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 bg-primary/10" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
                <div className="pt-10">
                    <Skeleton className="h-10 w-full bg-muted" />
                </div>
            </div>
         ))}
      </div>
    </div>
  );
}