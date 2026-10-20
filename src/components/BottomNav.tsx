'use client';

import React from 'react';
import { BookOpen, Bookmark, MessageSquare, BookMarked, User } from 'lucide-react';
import { AppTab } from '@/types/book';

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  savedCount: number;
  myListingsCount: number;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  myListingsCount,
  unreadChatCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden editorial-glass border-t border-stone-200/80 dark:border-zinc-800 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center px-1.5 py-1.5">
        {/* 1. Asosiy ('home') */}
        <button
          id="bottom-nav-home"
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-[#141413] dark:text-[#F8F7F4] font-bold'
              : 'text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            {currentTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#141413] dark:bg-[#F8F7F4]" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Asosiy</span>
        </button>

        {/* 2. Saqlangan ('saved') */}
        <button
          id="bottom-nav-saved"
          type="button"
          onClick={() => onSelectTab('saved')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            currentTab === 'saved'
              ? 'text-[#141413] dark:text-[#F8F7F4] font-bold'
              : 'text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold bg-amber-500 text-white shadow-2xs">
                {savedCount}
              </span>
            )}
            {currentTab === 'saved' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#141413] dark:bg-[#F8F7F4]" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Saqlanganlar</span>
        </button>

        {/* 3. Xabarlar ('messages') */}
        <button
          id="bottom-nav-messages"
          type="button"
          onClick={() => onSelectTab('messages')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            currentTab === 'messages'
              ? 'text-[#141413] dark:text-[#F8F7F4] font-bold'
              : 'text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold bg-amber-500 text-white shadow-2xs animate-pulse">
                {unreadChatCount}
              </span>
            )}
            {currentTab === 'messages' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#141413] dark:bg-[#F8F7F4]" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Xabarlar</span>
        </button>

        {/* 4. E'lonlarim ('my_listings') */}
        <button
          id="bottom-nav-my-listings"
          type="button"
          onClick={() => onSelectTab('my_listings')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            currentTab === 'my_listings'
              ? 'text-[#141413] dark:text-[#F8F7F4] font-bold'
              : 'text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            {myListingsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold bg-[#141413] text-[#F8F7F4] dark:bg-zinc-800 dark:text-stone-100 shadow-2xs">
                {myListingsCount}
              </span>
            )}
            {currentTab === 'my_listings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#141413] dark:bg-[#F8F7F4]" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">E&#39;lonlarim</span>
        </button>

        {/* 5. Kabinet ('profile') */}
        <button
          id="bottom-nav-profile"
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            currentTab === 'profile'
              ? 'text-[#141413] dark:text-[#F8F7F4] font-bold'
              : 'text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            {currentTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#141413] dark:bg-[#F8F7F4]" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Kabinet</span>
        </button>
      </div>
    </nav>
  );
};
