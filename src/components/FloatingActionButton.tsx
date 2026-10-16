'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      id="fab-add-book"
      type="button"
      onClick={onClick}
      aria-label="Kitob qo'shish"
      className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 group flex items-center gap-2.5 py-2.5 px-4 sm:py-3 sm:px-5 rounded-full bg-[#141413] text-[#F8F7F4] hover:bg-stone-800 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-white shadow-2xl shadow-stone-900/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-black/[0.08] dark:border-white/[0.15]"
    >
      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/15 dark:bg-black/10 transition-transform duration-300 group-hover:rotate-90">
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>
      <span className="text-xs sm:text-sm font-semibold tracking-wide font-sans">
        + Kitob qo&#39;shish
      </span>
    </button>
  );
};
