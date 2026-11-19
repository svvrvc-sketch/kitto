'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  visible?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <button
      id="fab-add-book"
      type="button"
      onClick={onClick}
      aria-label="Kitob joylash"
      className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 group flex items-center gap-2.5 py-2.5 px-4 sm:py-3 sm:px-5 rounded-full bg-amber-600 text-white hover:bg-amber-700 shadow-2xl shadow-stone-900/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-500/30"
    >
      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/15 dark:bg-black/10 transition-transform duration-300 group-hover:rotate-90">
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>
      <span className="text-xs sm:text-sm font-semibold tracking-wide font-sans">
        + Kitob joylash
      </span>
    </button>
  );
};
