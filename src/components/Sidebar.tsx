'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  ArrowLeftRight,
  MessageSquare,
  Bookmark,
  User as UserIcon,
  Plus,
  LogOut,
  ShieldCheck,
  HelpCircle,
  X,
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
  const currentTab = searchParams.get('tab') || 'my_books';
  const { user, isAuthenticated, logout, loginWithGoogle } = useAuth();
  const { totalUnreadCount } = useChat();

  const isLinkActive = (path: string, tab?: string) => {
    if (tab) {
      return pathname === path && currentTab === tab;
    }
    return pathname === path;
  };

  const navItems = [
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
      group: 'SOZLAMALAR',
      items: [
        {
          label: 'Profil sozlamalari',
          href: '/cabinet?tab=profile',
          icon: UserIcon,
          active: isLinkActive('/cabinet', 'profile'),
        },
      ],
    },
    {
      group: "QO'LLANMA",
      items: [
        {
          label: 'Qanday ishlaydi?',
          href: '/how-it-works',
          icon: HelpCircle,
          active: pathname === '/how-it-works',
        },
        {
          label: 'Xavfsizlik qoidalari',
          href: '/safety',
          icon: ShieldCheck,
          active: pathname === '/safety',
        },
      ],
    },
  ];

  const content = (
    <aside className="h-full flex flex-col justify-between p-4 bg-[#FAF9F5] dark:bg-stone-900 border-r border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 select-none">
      <div className="space-y-4">
        {/* 1. Prominent "Asosiy do'konga qaytish" Button */}
        <Link
          href="/"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-100 font-semibold text-xs border border-stone-300/50 dark:border-stone-700 transition-all group"
          title="Asosiy katalogga o'tish"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300 group-hover:-translate-x-0.5 transition-transform" />
            <span>Asosiy do&#39;konga qaytish</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">&rarr;</span>
        </Link>

        {/* 2. Brand Header: Shaxsiy Kabinet */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-600 text-white shadow-xs">
              <LogoIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1 font-sans text-lg font-extrabold tracking-tight">
                <span>Kitto</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mb-1" />
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                Shaxsiy Kabinet
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 3. Action Button: Kitob joylash */}
        <div>
          <Link
            href="/add-book"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Kitob qo&#39;shish</span>
          </Link>
        </div>

        {/* 4. Navigation Sections */}
        <nav className="space-y-4 pt-1">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
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
                          ? 'bg-amber-600 text-white dark:bg-amber-600 dark:text-white shadow-xs'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
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

      {/* 5. Footer: User Status Card & Logout */}
      <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-100/80 dark:bg-stone-800/60">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'Kitobxon'}
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {(user.name || 'K').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-stone-900 dark:text-stone-100">
                    {user.name || 'Kitobxon'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    <span>Ishonchli kitobxon</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 hover:text-red-600 transition-colors shrink-0"
                title="Chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => loginWithGoogle()}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Google orqali kirish</span>
          </button>
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
        <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 bg-[#FAF9F5] dark:bg-stone-900 border-r border-stone-200/90 dark:border-stone-800" />
      }
    >
      <SidebarInner {...props} />
    </Suspense>
  );
};
