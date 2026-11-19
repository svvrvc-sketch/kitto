'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, Bookmark, MessageSquare, Plus, User } from 'lucide-react';

interface BottomNavProps {
  savedCount?: number;
  unreadChatCount?: number;
}

const BottomNavInner: React.FC<BottomNavProps> = ({
  savedCount = 0,
  unreadChatCount = 0,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const isHome = pathname === '/';
  const isAddBook = pathname === '/add-book';
  const isMessages = pathname === '/messages';
  const isWishlist = pathname === '/cabinet' && tab === 'wishlist';
  const isCabinet = pathname === '/cabinet' && tab !== 'wishlist';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#FAF9F5]/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center px-1 py-1.5">
        {/* 1. Asosiy (Do'kon) */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isHome
              ? 'text-stone-900 dark:text-stone-100 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5 stroke-[1.8]" />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Do&#39;kon</span>
        </Link>

        {/* 2. Saqlanganlar (Wishlist) */}
        <Link
          href="/cabinet?tab=wishlist"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            isWishlist
              ? 'text-stone-900 dark:text-stone-100 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 stroke-[1.8]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold bg-amber-500 text-white shadow-2xs">
                {savedCount}
              </span>
            )}
            {isWishlist && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Istaklar</span>
        </Link>

        {/* 3. + Kitob joylash (Hero Middle Button) */}
        <Link
          href="/add-book"
          className="flex flex-col items-center justify-center -mt-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">Joylash</span>
        </Link>

        {/* 4. Xabarlar */}
        <Link
          href="/messages"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            isMessages
              ? 'text-stone-900 dark:text-stone-100 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 stroke-[1.8]" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold bg-emerald-600 text-white animate-pulse">
                {unreadChatCount}
              </span>
            )}
            {isMessages && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Xabarlar</span>
        </Link>

        {/* 5. Kabinet */}
        <Link
          href="/cabinet"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            isCabinet
              ? 'text-stone-900 dark:text-stone-100 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 stroke-[1.8]" />
            {isCabinet && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600" />
            )}
          </div>
          <span className="text-[9px] tracking-tight mt-1 truncate">Kabinet</span>
        </Link>
      </div>
    </nav>
  );
};

export const BottomNav: React.FC<BottomNavProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <BottomNavInner {...props} />
    </Suspense>
  );
};
