"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface DetailPageSkeletonProps {
  /** Number of tab placeholders to show */
  tabs?: number;
  /** Show avatar placeholder in header */
  showAvatar?: boolean;
}

export function DetailPageSkeleton({ tabs = 6, showAvatar = false }: DetailPageSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-9 shrink-0 rounded-md" />
        <div className="flex flex-1 items-center gap-3">
          {showAvatar && <Skeleton className="size-10 rounded-full" />}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 overflow-hidden rounded-lg border p-1">
          {Array.from({ length: tabs }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-md" />
          ))}
        </div>
        {/* Tab content placeholder */}
        <TabContentSkeleton />
      </div>
    </div>
  );
}

interface TabContentSkeletonProps {
  /** Number of skeleton rows to show */
  rows?: number;
  /** Number of skeleton columns per row */
  cols?: number;
}

export function TabContentSkeleton({ rows = 5, cols = 6 }: TabContentSkeletonProps) {
  return (
    <div className="rounded-lg border">
      {/* Toolbar placeholder */}
      <div className="flex items-center justify-between border-b p-3">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      {/* Table rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
