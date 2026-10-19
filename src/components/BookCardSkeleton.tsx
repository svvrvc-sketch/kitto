'use client';

import React from 'react';

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-stone-200/90 dark:border-zinc-800 shadow-book animate-pulse">
      {/* Cover Skeleton */}
      <div className="relative aspect-[3/4] w-full bg-stone-200/80 dark:bg-zinc-800">
        {/* Top badge placeholder */}
        <div className="absolute top-2.5 left-2.5 h-4 w-20 rounded-md bg-stone-300 dark:bg-zinc-700" />
        {/* Save button placeholder */}
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-stone-300 dark:bg-zinc-700" />
      </div>

      {/* Info Body Skeleton */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Title line */}
          <div className="h-4 w-4/5 rounded bg-stone-200 dark:bg-zinc-800" />
          {/* Author line */}
          <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-zinc-800" />
        </div>

        {/* Location & Meta info */}
        <div className="pt-2 border-t border-stone-100 dark:border-zinc-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-stone-200 dark:bg-zinc-800 shrink-0" />
            <div className="h-2.5 w-3/4 rounded bg-stone-200 dark:bg-zinc-800" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-1/3 rounded bg-stone-200 dark:bg-zinc-800" />
            <div className="h-2.5 w-1/4 rounded bg-stone-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
};
