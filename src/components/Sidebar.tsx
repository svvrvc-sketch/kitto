'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Compass,
  BookOpen,
  ArrowLeftRight,
  MessageSquare,
  Bookmark,
  User as UserIcon,
  Plus,
  LogOut,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { LogoIcon } from './Logo';

export interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const SidebarInner: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || '';
  const { user, isAuthenticated, logout, openAuthModal, loginWithGoogle } = useAuth();
  const { totalUnreadCount } = useChat();

  const isLinkActive = (path: string, tab?: string) => {
    if (tab) {
      return pathname === path && currentTab === tab;
    }
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      group: 'ASOSIY',
      items: [
        {
          label: 'Kashf qilish',
          href: '/',
          icon: Compass,
          active: isLinkActive('/'),
        },
        {
          label: 'Kitob joylash',
          href: '/add-book',
          icon: Plus,
          badge: 'Yangi',
          badgeColor: 'bg-amber-500 text-white',
          active: isLinkActive('/add-book'),
        },
      ],
    },
    {
      group: 'SHAXSIY JAVON',
      items: [
        {
          label: 'Mening javonim',
          href: '/cabinet?tab=my_books',
          icon: BookOpen,
          active: isLinkActive('/cabinet', 'my_books'),
        },
        {
          label: 'Almashuvlar & Mutolaa',
          href: '/cabinet?tab=swaps',
          icon: ArrowLeftRight,
          active: isLinkActive('/cabinet', 'swaps'),
        },
        {
          label: 'Xabarlar & Takliflar',
          href: '/messages',
          icon: MessageSquare,
          badge: totalUnreadCount > 0 ? String(totalUnreadCount) : undefined,
          badgeColor: 'bg-emerald-600 text-white',
          active: isLinkActive('/messages'),
        },
        {
          label: 'Istaklarim (Wishlist)',
          href: '/cabinet?tab=wishlist',
          icon: Bookmark,
          active: isLinkActive('/cabinet', 'wishlist'),
        },
      ],
    },
    {
      group: 'HISOB',
      items: [
        {
          label: 'Shaxsiy kabinet',
          href: '/cabinet?tab=profile',
          icon: UserIcon,
          active: isLinkActive('/cabinet', 'profile') || (pathname === '/cabinet' && !currentTab),
        },
      ],
    },
  ];

  const content = (
    <aside className="h-full flex flex-col justify-between p-4 bg-[#FAF9F5] dark:bg-zinc-900 border-r border-stone-200/90 dark:border-zinc-800 text-stone-900 dark:text-stone-100 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group"
          >
            <div className="p-1.5 rounded-xl bg-stone-900 text-[#F8F7F4] dark:bg-stone-100 dark:text-stone-900 shadow-sm group-hover:scale-105 transition-transform">
              <LogoIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1 font-serif text-xl font-bold tracking-tight">
                <span>Kitto</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mb-1" />
              </div>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium tracking-wider uppercase">
                P2P Kitob almashish
              </p>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-zinc-800 text-stone-500"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Button: Kitob joylash */}
        <div className="px-1">
          <Link
            href="/add-book"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.98] group"
          >
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
            <span>Kitob qo&#39;shish</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5 px-1">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider uppercase text-stone-600 dark:text-zinc-300">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = item.active;

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                          : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-200/50 dark:hover:bg-zinc-800/80 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400 dark:text-amber-600' : 'text-stone-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-amber-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Info / Login */}
      <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 px-1">
        {isAuthenticated && user ? (
          <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-850 border border-stone-200/70 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-2.5">
            <Link
              href="/cabinet?tab=profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-stone-200 dark:border-zinc-700 shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#141413] text-white dark:bg-stone-100 dark:text-[#141413] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                  {(user.name || 'K').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-serif text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  {user.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">
                  <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Ishonch: {user.trustScore ?? 1} ball</span>
                </div>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
              title="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Kitob almashish</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-zinc-400 mt-1 leading-snug">
                Kitoblarni doimiy yoki vaqtincha almashish uchun kiring.
              </p>
            </div>

            <button
              onClick={() => {
                onCloseMobile?.();
                loginWithGoogle().catch(() => openAuthModal());
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-750 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-zinc-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google orqali kirish</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {content}
      </div>

      {/* Mobile Drawer Backdrop & Slide-over */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 bg-[#FDFCFB] dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800" />
      }
    >
      <SidebarInner {...props} />
    </Suspense>
  );
};
