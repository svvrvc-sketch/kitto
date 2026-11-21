'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, Bookmark, MessageSquare, Plus, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';

interface BottomNavProps {
  savedCount?: number;
  unreadChatCount?: number;
}

const BottomNavInner: React.FC<BottomNavProps> = ({
  savedCount: propSavedCount,
  unreadChatCount: propUnreadCount,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const { user, isAuthenticated } = useAuth();
  const chatContext = useChat();

  const savedCount = propSavedCount ?? (user?.wishlistBooks?.length || 0);
  const unreadChatCount = propUnreadCount ?? (chatContext?.totalUnreadCount || 0);

  const isCatalog = pathname === '/catalog' || pathname === '/';
  const isWishlist = (pathname === '/cabinet' && tab === 'wishlist') || (pathname === '/catalog' && tab === 'saved');
  const isMessages = pathname === '/messages' || pathname?.startsWith('/messages');
  const isCabinet = (pathname === '/cabinet' && tab !== 'wishlist') || (pathname?.startsWith('/cabinet') && tab !== 'wishlist');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0e1110]/95 dark:bg-[#0e1110]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 safe-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {/* 1. Do'kon / Katalog */}
        <Link
          href="/catalog"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            isCatalog && !isWishlist
              ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-300 font-medium'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-0.5">Do&#39;kon</span>
        </Link>

        {/* 2. Istaklar (Wishlist) */}
        <Link
          href="/cabinet?tab=wishlist"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
            isWishlist
              ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 stroke-[2]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[8px] font-bold bg-amber-500 text-white shadow-xs">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Istaklar</span>
        </Link>

        {/* 3. + Joylash (Center Action Pill) */}
        <Link
          href="/add-book"
          className="flex flex-col items-center justify-center -mt-3.5 group active:scale-90 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 border border-amber-400/30">
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">Joylash</span>
        </Link>

        {/* 4. Xabarlar (Chatlar) */}
        <Link
          href="/messages"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
            isMessages
              ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 stroke-[2]" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[8px] font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Chatlar</span>
        </Link>

        {/* 5. Profil (Kabinet) */}
        <Link
          href="/cabinet"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
            isCabinet
              ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-300 font-medium'
          }`}
        >
          {isAuthenticated && user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'Profil'}
              className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
            />
          ) : (
            <User className="w-5 h-5 stroke-[2]" />
          )}
          <span className="text-[10px] tracking-tight mt-0.5">Profil</span>
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
