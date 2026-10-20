'use client';

import React, { useState } from 'react';
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
  BookMarked,
  MessageSquare,
  Bookmark,
  Home,
  HelpCircle,
} from 'lucide-react';
import { AppTab } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Logo } from './Logo';
import Link from 'next/link';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  savedCount: number;
  myListingsCount: number;
  unreadChatCount?: number;
  onOpenCitySelector?: () => void;
  onOpenSupport?: () => void;
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
  onOpenSupport,
}) => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
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

  const navItems = [
    { id: 'home' as AppTab, label: 'Asosiy', icon: Home, count: 0 },
    { id: 'saved' as AppTab, label: 'Saqlanganlar', icon: Bookmark, count: savedCount },
    { id: 'messages' as AppTab, label: 'Xabarlar', icon: MessageSquare, count: unreadChatCount },
    { id: 'my_listings' as AppTab, label: "E'lonlarim", icon: BookMarked, count: myListingsCount },
    { id: 'profile' as AppTab, label: 'Kabinet', icon: UserIcon, count: 0 },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full editorial-glass border-b border-stone-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* 1. Left: Brand & Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="header-brand-logo"
              onClick={() => onSelectTab('home')}
              className="cursor-pointer group text-left focus:outline-none"
            >
              <Logo showTagline={false} />
            </button>
          </div>

          {/* 2. Center: Desktop Full Navigation (Visible on lg: 1024px+) */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-200/50 dark:bg-zinc-800/80 p-1 rounded-2xl border border-stone-200/60 dark:border-zinc-700/60 shrink-0">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        item.id === 'messages' || item.id === 'saved'
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#141413] text-[#F8F7F4] dark:bg-zinc-700 dark:text-stone-100'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 3. Center-Tablet Compact Navigation (Visible only on md: 768px-1023px) */}
          <nav className="hidden md:flex lg:hidden items-center gap-1 bg-stone-200/50 dark:bg-zinc-800/80 p-1 rounded-2xl border border-stone-200/60 dark:border-zinc-700 shrink-0">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all relative flex items-center gap-1 ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.count > 0 && (
                    <span className="px-1 rounded-full text-[8px] bg-amber-500 text-white font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 4. Right: Tools (Location, Profile, Theme, Hamburger) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Location Pill */}
            {onOpenCitySelector && (
              <button
                id="city-selector-btn"
                onClick={onOpenCitySelector}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-stone-50 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all shadow-xs shrink-0"
                title={`Hudud: ${user?.city || 'Toshkent shahri'}`}
              >
                <span className={`w-2 h-2 rounded-full ${isCityActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0`} />
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-700 dark:text-stone-300 shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-none">{userCityDisplay}</span>
              </button>
            )}

            {/* User Profile / Auth Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-all text-xs font-medium shadow-sm shrink-0"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'Foydalanuvchi'}
                      className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] font-bold text-xs flex items-center justify-center shrink-0">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    id="header-user-name"
                    className="hidden lg:inline text-stone-800 dark:text-stone-200 max-w-[100px] truncate font-medium"
                  >
                    {user.name || 'Kitobxon'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 pr-0.5 hidden sm:inline" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial p-2 z-50 animate-in fade-in duration-150"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="p-2 border-b border-stone-100 dark:border-zinc-800">
                      <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {user.name || 'Kitobxon'}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                        {user.contact || ''}
                      </div>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <button
                        id="menu-tab-profile"
                        onClick={() => {
                          onSelectTab('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center justify-between"
                      >
                        <span>Kabinet</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('my_listings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center justify-between"
                      >
                        <span>E&#39;lonlarim</span>
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
                        <span>Saqlanganlar</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-full">
                          {savedCount}
                        </span>
                      </button>

                      {onOpenSupport && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenSupport();
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium flex items-center gap-2"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Yordam va takliflar</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-stone-100 dark:border-zinc-800">
                      <button
                        id="header-logout-btn"
                        onClick={handleLogout}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Tizimdan chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => openAuthModal('Kitob almashish va e\'lon joylash uchun profilingizga kiring')}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-medium text-xs shadow-sm active:scale-95 transition-all shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </button>
            )}

            {/* Support Button (Desktop & Tablet) */}
            {onOpenSupport && (
              <button
                id="header-support-btn"
                onClick={onOpenSupport}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-stone-300 transition-colors shadow-xs text-xs font-medium shrink-0"
                title="Yordam va takliflar: +998337533373, @kitto_support"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline">Yordam</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm shrink-0"
              aria-label="Mavzuni almashtirish"
              title="Mavzuni almashtirish"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* Tablet Hamburger Button (BottomNav handles phones, Full Nav handles desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hidden md:flex lg:hidden p-2 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm shrink-0"
              aria-label="Menyu"
              title="Menyu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-start pt-16 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 shadow-2xl p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-100 dark:border-zinc-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900 shadow-sm'
                        : 'bg-stone-50 dark:bg-zinc-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500 text-white font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold text-xs border border-amber-200/60 dark:border-amber-900/40"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel boshqaruvi</span>
              </Link>
            )}

            {onOpenSupport && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSupport();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-xs border border-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Yordam va takliflar</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-zinc-400">@kitto_support</span>
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Tizimdan chiqish</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("Kitob almashish va e'lon joylash uchun profilingizga kiring");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900 font-semibold text-xs shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                <span>Tizimga kirish</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
