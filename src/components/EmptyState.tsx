'use client';

import React from 'react';
import { BookOpen, PlusCircle, Search, Bookmark, BookMarked, Sparkles, RotateCcw } from 'lucide-react';
import { AppTab } from '@/types/book';

interface EmptyStateProps {
  onResetFilters?: () => void;
  onOpenAddModal: () => void;
  onGoToFeed?: () => void;
  onOpenAuthModal?: () => void;
  isAuthenticated?: boolean;
  searchQuery?: string;
  tab?: AppTab | 'feed' | 'my-shelf';
  isTotalEmpty?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onResetFilters,
  onOpenAddModal,
  onGoToFeed,
  onOpenAuthModal,
  isAuthenticated = false,
  searchQuery,
  tab = 'home',
  isTotalEmpty = false,
}) => {
  const isMyListingsTab = tab === 'my_listings' || tab === 'my-shelf';
  const isSavedTab = tab === 'saved';

  // 1. My Listings Empty State
  if (isMyListingsTab) {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-stone-100/90 dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 shadow-book">
            <BookMarked className="w-9 h-9 text-[#141413] dark:text-stone-200 stroke-[1.25]" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
            Eʼlonlar
          </h3>
          <p className="max-w-md text-sm text-stone-500 dark:text-zinc-400 font-sans leading-relaxed mb-6">
            Joylangan kitoblarni koʻrish, holatini yangilash yoki oʻchirish uchun tizimga kiring.
          </p>

          {onOpenAuthModal && (
            <button
              id="empty-shelf-login-btn"
              onClick={onOpenAuthModal}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-md transition-all active:scale-95"
            >
              <span>Tizimga kirish</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center animate-in fade-in duration-200">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-stone-100/90 dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 shadow-book">
          <BookMarked className="w-9 h-9 text-[#141413] dark:text-stone-200 stroke-[1.25]" />
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
            <PlusCircle className="w-3.5 h-3.5 stroke-[2]" />
          </div>
        </div>

        <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          Hozircha kitoblar joylanmagan
        </h3>
        <p className="max-w-md text-sm text-stone-500 dark:text-zinc-400 font-sans leading-relaxed mb-6">
          Javoningizdagi kitoblarni ulashing — vaqtincha o&#39;qishga bering yoki boshqasiga almashtiring.
        </p>

        <button
          id="empty-shelf-add-btn"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Kitob joylash</span>
        </button>
      </div>
    );
  }

  // 2. Saved Tab Empty State
  if (isSavedTab) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center animate-in fade-in duration-200">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-stone-100/90 dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 shadow-book">
          <Bookmark className="w-9 h-9 text-amber-600 dark:text-amber-400 stroke-[1.25]" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          Saqlangan kitoblar yo&#39;q
        </h3>
        <p className="max-w-md text-sm text-stone-500 dark:text-zinc-400 font-sans leading-relaxed mb-6">
          O&#39;zingizga yoqqan kitoblarni belgilab, ularni shu yerda saqlab qo&#39;yishingiz mumkin.
        </p>

        {onGoToFeed && (
          <button
            id="empty-saved-go-feed-btn"
            onClick={onGoToFeed}
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kitoblarni ko&#39;rish</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Platform Day-1 Main Feed Empty State (Bazada umuman kitob bo'lmaganda)
  if (isTotalEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center animate-in fade-in duration-200">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-stone-100/90 dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 shadow-book">
          <Sparkles className="w-9 h-9 text-amber-600 dark:text-amber-400 stroke-[1.25]" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          Hozircha e&#39;lonlar yo&#39;q, birinchi bo&#39;lib qo&#39;shing
        </h3>
        <p className="max-w-md text-sm text-stone-500 dark:text-zinc-400 font-sans leading-relaxed mb-6">
          Toshkent bo&#39;ylab birinchi bo&#39;lib o&#39;z kitobingizni joylang va boshqa kitobxonlar bilan ulashing.
        </p>

        <div className="flex items-center justify-center w-full max-w-xs">
          <button
            id="empty-feed-add-btn"
            onClick={onOpenAddModal}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kitob joylash</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Search / Filter Empty State (Filtr yoki qidiruv bo'yicha hech narsa topilmaganda)
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-stone-100/90 dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 shadow-book">
        <BookOpen className="w-9 h-9 text-stone-800 dark:text-stone-200 stroke-[1.25]" />
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
          <Search className="w-3.5 h-3.5 stroke-[2]" />
        </div>
      </div>

      <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
        Bunday parametrlar bo&#39;yicha kitob topilmadi.
      </h3>
      <p className="max-w-md text-sm text-stone-500 dark:text-zinc-400 font-sans leading-relaxed mb-6">
        {searchQuery ? (
          <>
            <span className="font-semibold text-stone-900 dark:text-stone-200 font-serif">
              &ldquo;{searchQuery}&rdquo;
            </span>{' '}
            soʻrovi boʻyicha eʼlon topilmadi. Filtrni tozalang yoki yangi kitob joylang.
          </>
        ) : (
          "Tanlangan filtr parametrlari bo'yicha e'lon topilmadi. Filtrni tozalang yoki yangi kitob joylang."
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
        {onResetFilters && (
          <button
            id="empty-reset-filters-btn"
            onClick={onResetFilters}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-stone-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 font-semibold text-xs tracking-wider transition-colors border border-stone-300 dark:border-zinc-700 shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Filtrni tozalash</span>
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Kitob joylash</span>
        </button>
      </div>
    </div>
  );
};
