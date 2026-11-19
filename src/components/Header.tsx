'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  ChevronDown,
  MapPin,
  Menu,
  X,
  Shield,
  BookOpen,
  MessageSquare,
  Bookmark,
  Plus,
  HelpCircle,
  ArrowLeftRight,
} from 'lucide-react';
import { AppTab } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from './Logo';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  currentTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  savedCount?: number;
  myListingsCount?: number;
  unreadChatCount?: number;
  onOpenCitySelector?: () => void;
  onOpenSupport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  currentTab = 'home',
  onSelectTab,
  savedCount = 0,
  myListingsCount = 0,
  unreadChatCount = 0,
  onOpenCitySelector,
  onOpenSupport,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, openAuthModal, loginWithGoogle, logout } = useAuth();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userCityDisplay = user?.city
    ? user.city.includes('Toshkent')
      ? 'Toshkent'
      : user.city.replace(' viloyati', '').replace(' Respublikasi', '')
    : 'Toshkent';
  const isCityActive = !user?.city || user.city.includes('Toshkent');

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
    showToast('Tizimdan muvaffaqiyatli chiqdingiz', 'info');
  };

  const handleAddBookClick = () => {
    if (!isAuthenticated || !user) {
      openAuthModal('Kitob joylash uchun profilingizga kiring');
      return;
    }
    router.push('/add-book');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      openAuthModal('Google orqali kirishda xatolik yuz berdi');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* 1. Left: Brand & City Selector */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link href="/" className="cursor-pointer group text-left focus:outline-none">
              <Logo showTagline={false} />
            </Link>

            {/* City Selector Pill */}
            {onOpenCitySelector && (
              <button
                id="city-selector-btn"
                onClick={onOpenCitySelector}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all shadow-2xs"
                title={`Hudud: ${user?.city || 'Toshkent shahri'}`}
              >
                <span className={`w-2 h-2 rounded-full ${isCityActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0`} />
                <MapPin className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300 shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-none">{userCityDisplay}</span>
              </button>
            )}
          </div>

          {/* 2. Center: Store Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-stone-900 dark:text-stone-100 bg-stone-200/60 dark:bg-stone-800 transition-all"
            >
              Katalog (Do&#39;kon)
            </Link>
            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                className="px-3 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all"
              >
                Yordam
              </button>
            )}
          </nav>

          {/* 3. Right: Actions & User Account */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* + Kitob joylash button (Desktop/Tablet only: mobile uses bottom nav) */}
            <button
              onClick={handleAddBookClick}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Kitob joylash</span>
            </button>

            {/* If Logged In: Chat Icon + Cabinet Profile Dropdown */}
            {isAuthenticated && user ? (
              <>
                {/* Chat notifications (Desktop only: mobile uses bottom nav) */}
                <Link
                  href="/messages"
                  className="hidden sm:flex relative p-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-all shadow-2xs"
                  title="Xabarlar"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </Link>

                {/* User Cabinet Pill & Dropdown */}
                <div className="relative">
                  <button
                    id="user-profile-menu-btn"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/90 dark:bg-stone-800/90 hover:border-stone-400 dark:hover:border-stone-700 transition-all text-xs font-semibold shadow-2xs"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'Kitobxon'}
                        className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {(user.name || 'K').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[90px] truncate text-stone-800 dark:text-stone-200">
                      {user.name || 'Kitobxon'}
                    </span>
                    <span className="hidden sm:inline px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-[10px] text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider">
                      Kabinet
                    </span>
                    <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-2 z-50 animate-in fade-in duration-150"
                      onMouseLeave={() => setShowProfileMenu(false)}
                    >
                      <div className="p-2.5 border-b border-stone-100 dark:border-stone-800">
                        <div className="font-sans font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {user.name || 'Kitobxon'}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {user.email || user.contact || ''}
                        </div>
                      </div>

                      <div className="py-1 space-y-0.5">
                        <Link
                          href="/cabinet"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>Shaxsiy kabinetim</span>
                          </span>
                          <span className="text-[10px] text-stone-400">&rarr;</span>
                        </Link>

                        <Link
                          href="/cabinet?tab=my_books"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                            <span>Mening javonim</span>
                          </span>
                          {myListingsCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-full">
                              {myListingsCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/cabinet?tab=swaps"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-stone-500" />
                            <span>Almashuvlarim</span>
                          </span>
                        </Link>

                        <Link
                          href="/cabinet?tab=wishlist"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                            <span>Istaklarim (Wishlist)</span>
                          </span>
                          {savedCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-full">
                              {savedCount}
                            </span>
                          )}
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold flex items-center gap-2"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Admin boshqaruvi</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Tizimdan chiqish</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* If Guest: Google Login Button */
              <button
                id="header-google-login-btn"
                onClick={handleGoogleLogin}
                className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Kirish</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-2xs shrink-0"
              title="Mavzuni almashtirish"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
