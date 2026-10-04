/**
 * Skeleton — Brand-aligned loading placeholder
 *
 * Uses rounded corners and brand light background (#F1F5F9)
 * with a subtle pulse/shimmer animation.
 */
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-light border border-gray-border/40",
        className,
      )}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-xl)] bg-white border border-gray-border/60 p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <Skeleton className="h-6 w-4/5 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>

      <div className="pt-2 border-t border-light space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>

      <div className="pt-3 border-t border-light flex justify-between items-end">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-[var(--radius-xl)] bg-white border border-gray-border/60 p-5 space-y-2 shadow-xs"
        >
          <Skeleton className="h-3 w-20 rounded-sm" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
