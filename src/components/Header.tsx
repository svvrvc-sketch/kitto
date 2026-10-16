'use client';

import React, { useState } from 'react';
import { Moon, Sun, User as UserIcon, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { AppTab } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from './Logo';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  savedCount: number;
  myListingsCount: number;
  unreadChatCount?: number;
  onOpenCitySelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  currentTab,
  onSelectTab,
  savedCount,
  myListingsCount,
  unreadChatCount = 0,
  onOpenCitySelector,
}) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    showToast('Tizimdan muvaffaqiyatli chiqdingiz', 'info');
  };

  return (
    <header className="sticky top-0 z-30 w-full editorial-glass border-b border-stone-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Editorial Logo: Kitto.uz */}
        <button
          type="button"
          id="header-brand-logo"
          onClick={() => onSelectTab('home')}
          className="cursor-pointer group text-left focus:outline-none"
        >
          <Logo showTagline={true} />
        </button>

        {/* Desktop Navigation Links (5-Tab Standard) */}
        <div className="hidden sm:flex items-center gap-1 bg-stone-200/50 dark:bg-zinc-800/80 p-1 rounded-xl border border-stone-200/60 dark:border-zinc-700">
          {/* 1. Asosiy */}
          <button
            id="nav-tab-home"
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentTab === 'home'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
          >
            Asosiy
          </button>

          {/* 2. Saqlangan */}
          <button
            id="nav-tab-saved"
            onClick={() => onSelectTab('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${currentTab === 'saved'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
          >
            Saqlangan
            {savedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* 3. Xabarlar */}
          <button
            id="nav-tab-messages"
            onClick={() => onSelectTab('messages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${currentTab === 'messages'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
          >
            Xabarlar
            {unreadChatCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-bold animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* 4. E'lonlarim */}
          <button
            id="nav-tab-my-listings"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal("Shaxsiy eʼlonlaringizni koʻrish uchun tizimga kiring");
                return;
              }
              onSelectTab('my_listings');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${currentTab === 'my_listings'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
          >
            E&#39;lonlar
            {myListingsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-[#141413] text-[#F8F7F4] dark:bg-zinc-800 dark:text-stone-100 font-bold">
                {myListingsCount}
              </span>
            )}
          </button>

          {/* 5. Kabinet */}
          <button
            id="nav-tab-profile"
            onClick={() => onSelectTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${currentTab === 'profile'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
          >
            Kabinet
          </button>
        </div>

        {/* Right Tools: 📍 Toshkent pill button, Auth & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Header Location Trigger: 📍 Toshkent with subtle chevron */}
          {onOpenCitySelector && (
            <button
              id="city-selector-btn"
              onClick={onOpenCitySelector}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all shadow-xs active:scale-95"
              title="Hududni almashtirish yoki ovoz berish"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>📍 Toshkent</span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>
          )}

          {/* User Auth / Profile */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 transition-all text-xs font-medium shadow-sm"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span id="header-user-name" className="hidden md:inline text-stone-800 dark:text-stone-200 max-w-[120px] truncate font-medium">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 pr-0.5" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial p-2 z-50 animate-in fade-in duration-150"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="p-2 border-b border-stone-100 dark:border-zinc-800">
                    <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                      {user.contact}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="menu-tab-profile"
                      onClick={() => {
                        onSelectTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center justify-between"
                    >
                      <span>Shaxsiy kabinet</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('my_listings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center justify-between"
                    >
                      <span>E&#39;lonlar</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 rounded-full">
                        {myListingsCount}
                      </span>
                    </button>
                    <button
                      id="menu-tab-messages"
                      onClick={() => {
                        onSelectTab('messages');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center justify-between"
                    >
                      <span>Xabarlar</span>
                      {unreadChatCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-full">
                          {unreadChatCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('saved');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center justify-between"
                    >
                      <span>Saqlangan kitoblar</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                        {savedCount}
                      </span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-stone-100 dark:border-zinc-800">
                    <button
                      id="header-logout-btn"
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-red-700 hover:text-red-900 dark:text-red-400 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Hisobdan chiqish</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => openAuthModal("Kitto platformasiga kirish")}
              className="flex items-center gap-2 py-1.5 px-3.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-medium text-xs shadow-sm active:scale-95 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Kirish</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm"
            aria-label="Mavzuni almashtirish"
            title="Mavzuni almashtirish"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
