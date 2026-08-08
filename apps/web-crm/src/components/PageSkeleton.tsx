import React from "react";

interface PageSkeletonProps {
  rows?: number;
  showCards?: boolean;
}

/** Skeleton reutilizable para pantallas CRM */
export function PageSkeleton({ rows = 4, showCards = true }: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {showCards ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-panel p-5 border border-white/5"
            >
              <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
              <div className="h-8 bg-[#C9A45C]/20 rounded w-1/3 mb-2" />
              <div className="h-2 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="glass-panel p-4 sm:p-6 space-y-3 border border-white/5">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
          >
            <div className="h-10 w-10 rounded-xl bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/10 rounded w-2/5" />
              <div className="h-2 bg-white/5 rounded w-3/5" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-[#C9A45C]/15 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
