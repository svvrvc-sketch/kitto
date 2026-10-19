'use client';

import React, { useState, useRef } from 'react';
import { Book } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { compressBookImage } from '@/utils/imageCompressor';
import {
  User as UserIcon,
  BookMarked,
  Bookmark,
  PlusCircle,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Edit3,
  Check,
  X,
  RefreshCw,
  Compass,
  Clock,
  BookOpen,
  Camera,
  Phone,
  Send,
  HelpCircle,
  QrCode,
  Bell,
} from 'lucide-react';
import { SUPPORT_PHONE, SUPPORT_TELEGRAM } from '@/lib/telegram-admin';

const GENRE_CHIPS = [
  'Badiiy adabiyot',
  'Shaxsiy rivojlanish',
  'Biznes va moliya',
  'Psixologiya',
  'Tarixiy',
  'Ilmiy-ommabop',
  'Jahon adabiyoti',
  'Detektiv',
];

interface ProfileTabProps {
  myListingsCount: number;
  swappedCount?: number;
  savedCount: number;
  onGoToMyListings: () => void;
  onGoToSaved: () => void;
  onOpenAddModal: () => void;
  myBooks?: Book[];
  onActivateBook?: (bookId: string) => void;
  onOpenBookDetail?: (book: Book) => void;
  onOpenSupport?: () => void;
  onOpenQRModal?: (book: Book, mode: 'handover' | 'return') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  myListingsCount,
  swappedCount = 0,
  savedCount,
  onGoToMyListings,
  onGoToSaved,
  onOpenAddModal,
  myBooks = [],
  onActivateBook,
  onOpenBookDetail,
  onOpenSupport,
  onOpenQRModal,
}) => {
  const { user, isAuthenticated, openAuthModal, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editTelegram, setEditTelegram] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [wishlistInput, setWishlistInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditContact(user.contact);
    setEditTelegram(user.telegramUsername || '');
    setEditAvatar(user.avatar || null);
    setIsEditing(true);
  };

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Faqat rasm formatidagi fayllarni yuklashingiz mumkin', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const compressed = await compressBookImage(file, 400, 0.82);
      updateProfile({ avatar: compressed });
      if (isEditing) setEditAvatar(compressed);
      showToast('Profil rasmi muvaffaqiyatli yuklandi ✓', 'success');
    } catch {
      showToast('Rasmni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editContact.trim()) {
      showToast('Ism va telefon raqamini kiriting', 'error');
      return;
    }
    updateProfile({
      name: editName.trim(),
      contact: editContact.trim(),
      telegramUsername: editTelegram.trim() ? editTelegram.trim().replace(/^@/, '') : undefined,
      avatar: editAvatar || undefined,
    });
    setIsEditing(false);
    showToast('Profil maʼlumotlari saqlandi', 'success');
  };

  const handleLogout = () => {
    logout();
    showToast('Hisobdan chiqildi', 'info');
  };

  const handleToggleGenre = (genre: string) => {
    const current = user?.favoriteGenres || [];
    const updated = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    updateProfile({ favoriteGenres: updated });
  };

  const handleAddWishlistBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = wishlistInput.trim();
    if (!trimmed) return;
    const current = user?.wishlistBooks || [];
    if (current.length >= 6) {
      showToast("Ko'pi bilan 6 ta kitob kiritish mumkin", 'error');
      return;
    }
    if (current.includes(trimmed)) {
      showToast("Ushbu kitob ro'yxatda mavjud", 'info');
      return;
    }
    const updated = [...current, trimmed];
    updateProfile({ wishlistBooks: updated });
    setWishlistInput('');
    showToast(`"${trimmed}" ro'yxatga qo'shildi`, 'success');
  };

  const handleRemoveWishlistBook = (bookToRemove: string) => {
    const current = user?.wishlistBooks || [];
    const updated = current.filter((b) => b !== bookToRemove);
    updateProfile({ wishlistBooks: updated });
  };

  const getDaysRemaining = (dueAt?: string) => {
    if (!dueAt) return 0;
    const diffMs = new Date(dueAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // Temporarily given books
  const temporarilyGivenBooks = myBooks.filter(
    (b) => b.status === 'temporarily_given'
  );

  // 1. Guest State (Unauthenticated)
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto py-10 sm:py-14 px-4 animate-in fade-in duration-300">
        <div className="text-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial relative overflow-hidden">
          {/* Round placeholder avatar */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center border border-stone-200 dark:border-zinc-700 shadow-sm">
            <UserIcon className="w-8 h-8 text-stone-700 dark:text-stone-300 stroke-[1.6]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold tracking-[0.16em] uppercase bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border border-stone-200/80 dark:border-zinc-700 mb-3">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Mehmon</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Shaxsiy kabinetga kirish
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            Kitob eʼlonlarini boshqarish, xatchoʻplarni saqlash va boshqa kitobxonlar bilan bogʻlanish uchun profilingizga kiring.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="profile-guest-login-btn"
              type="button"
              onClick={() => openAuthModal('Shaxsiy kabinetga kirish')}
              className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              <span>Tizimga kirish</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-[11px] text-stone-500 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Maxfiy va xavfsiz foydalanish</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged In State (Shaxsiy Kabinet)
  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Editorial Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2.5">
          <span>Shaxsiy Kabinet</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
          Foydalanuvchi maʼlumotlari, sevimli yoʻnalishlar va joylangan kitoblar
        </p>
      </div>

      {/* User Identity Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial relative overflow-hidden">
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Hidden file input for direct avatar upload */}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                onChange={handleDirectAvatarUpload}
                className="hidden"
                id="profile-avatar-direct-input"
              />

              <div className="relative shrink-0 group">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 dark:border-zinc-700 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#141413] dark:bg-stone-100 text-white dark:text-[#141413] font-serif font-bold text-2xl flex items-center justify-center shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Interactive Camera Button on Avatar */}
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Profil rasmini almashtirish"
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                >
                  <Camera className="w-5 h-5 drop-shadow-md" />
                </button>

                <div className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-amber-500 text-white shadow-xs">
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="profile-user-name" className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ishonch bali: {user.trustScore ?? 1} ball</span>
                  </div>

                  {(user.isTrusted || (user.trustScore && user.trustScore >= 3)) && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold shadow-xs">
                      <span>🛡️ Ishonchli kitobxon</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1.5 text-xs">
                  <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                    <span>📞</span>
                    <span>{user.contact}</span>
                  </span>
                  {user.telegramUsername && (
                    <span className="font-medium text-sky-700 dark:text-sky-400 flex items-center gap-1">
                      <span>✈️</span>
                      <span>@{user.telegramUsername.replace(/^@/, '')}</span>
                    </span>
                  )}
                  {user.email && (
                    <span className="text-stone-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-medium text-stone-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>📍 {user.city || 'Toshkent'}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>{user.avatar ? 'Rasmni yangilash' : '+ Profil rasmi qoʻshish'}</span>
                </button>
              </div>
            </div>

            {/* Actions: Edit Profile & Logout */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                id="edit-profile-btn"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-all active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>

              <button
                id="profile-logout-btn"
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-red-700 hover:text-red-900 dark:text-red-400 border border-transparent hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        ) : (
          /* Inline Edit Form */
          <form onSubmit={handleSaveEdit} className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Profilni tahrirlash
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar section in edit mode */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700">
              <div className="relative shrink-0">
                {editAvatar ? (
                  <img
                    src={editAvatar}
                    alt="Profil"
                    className="w-14 h-14 rounded-full object-cover border-2 border-stone-300 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-stone-300 font-bold text-lg flex items-center justify-center">
                    {editName ? editName.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectAvatarUpload}
                  className="hidden"
                  id="profile-edit-avatar-input"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="profile-edit-avatar-input"
                    className="cursor-pointer px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-zinc-700 shadow-2xs transition-colors"
                  >
                    {editAvatar ? "Rasmni almashtirish" : "+ Rasm yuklash"}
                  </label>
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar(null)}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium transition-colors"
                    >
                      Oʻchirish
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">
                  JPG yoki PNG formatda, kvadrat shakl tavsiya etiladi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Ism va familiya *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Telefon raqam (majburiy) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Telegram username (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={editTelegram}
                    onChange={(e) => setEditTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-50 dark:hover:bg-zinc-800"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-semibold shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Saqlash</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Section 1: Sevimli yo'nalishlar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              Sevimli yo&#39;nalishlar
            </h3>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-zinc-500">
            Tanlash uchun bosing
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          Qiziqishlaringiz boshqa kitobxonlarga sizning profilingizda koʻrinadi.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {GENRE_CHIPS.map((genre) => {
            const isSelected = (user.favoriteGenres || []).includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => handleToggleGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border active:scale-95 ${
                  isSelected
                    ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900 border-[#141413] dark:border-stone-200 shadow-xs font-semibold'
                    : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-500'
                }`}
              >
                {genre}
                {isSelected && <span className="ml-1.5 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Qidirilayotgan kitoblar (Wishlist for Barter) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              Qidirilayotgan kitoblar
            </h3>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-zinc-500">
            {(user.wishlistBooks || []).length}/6 ta
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          Almashish uchun qidirilayotgan kitoblar ro&#39;yxati
        </p>

        {/* Input + Add button */}
        <form onSubmit={handleAddWishlistBook} className="flex gap-2 pt-1">
          <input
            id="wishlist-book-input"
            type="text"
            value={wishlistInput}
            onChange={(e) => setWishlistInput(e.target.value)}
            placeholder="Kitob nomi va muallifi..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400 transition-all"
          />
          <button
            type="submit"
            disabled={!wishlistInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            + Qo&#39;shish
          </button>
        </form>

        {/* Wishlist tags list */}
        {(user.wishlistBooks || []).length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {(user.wishlistBooks || []).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs"
              >
                <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveWishlistBook(item)}
                  className="p-0.5 ml-1 rounded hover:bg-amber-200/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-400 transition-colors"
                  title="O'chirish"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 dark:text-zinc-500 italic pt-1">
            Hozircha kitoblar qo&#39;shilmagan. Yuqoridagi maydondan kitob qo&#39;shing.
          </p>
        )}
      </div>

      {/* Section 3: Vaqtincha berilgan kitoblar (Temporary Reading Tracker) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              Vaqtincha berilgan kitoblar
            </h3>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-zinc-500">
            {temporarilyGivenBooks.length} ta
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          Mutolaaga berilgan kitoblar va ularning qaytish muddatlari
        </p>

        {temporarilyGivenBooks.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {temporarilyGivenBooks.map((book) => {
              const daysLeft = getDaysRemaining(book.loanInfo?.dueAt);

              return (
                <div
                  key={book.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40"
                >
                  <div
                    onClick={() => onOpenBookDetail && onOpenBookDetail(book)}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-stone-200 dark:bg-zinc-800 shrink-0 border border-black/10">
                      {book.coverUrl && !book.coverUrl.includes('unsplash.com') ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          📖
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                        {book.author}
                      </p>

                      <div className="mt-1 space-y-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>
                            {daysLeft > 0
                              ? `Qolgan vaqt: ${daysLeft} kun (14 kundan)`
                              : `Qaytarish muddati yetib keldi!`}
                          </span>
                        </span>

                        {/* Visual Progress Bar */}
                        <div className="w-full max-w-xs h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(10, ((14 - Math.max(0, daysLeft)) / 14) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {onOpenQRModal && (
                      <button
                        type="button"
                        onClick={() => onOpenQRModal(book, 'return')}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                        title="QR-kod bilan qabul qilish va +1 ishonch bali olish"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Qabul (+1 ball)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        // Trigger reminder notification
                        showToast(`✈️ Telegram bot orqali kitobxon eslatildi!`, 'info');
                        fetch('/api/telegram-chat-notify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            recipientId: book.ownerId,
                            recipientName: book.ownerName,
                            senderName: 'Kitto Eslatma Tizimi',
                            bookTitle: book.title,
                            messageSnippet: `Diqqat: "${book.title}" kitobining qaytish muddatiga ${daysLeft} kun qoldi. Iltimos oʻz vaqtida qaytaring.`,
                          }),
                        }).catch(() => {});
                      }}
                      className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors"
                      title="Telegram orqali qaytarish eslatmasini yuborish"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>

                    {onActivateBook && (
                      <button
                        type="button"
                        id={`activate-book-${book.id}`}
                        onClick={() => onActivateBook(book.id)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-850 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Faollashtirish</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-50/50 dark:bg-zinc-950/40 border border-stone-200/60 dark:border-zinc-800/80 text-center">
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Hozircha vaqtincha berilgan kitoblar mavjud emas
            </p>
          </div>
        )}
      </div>

      {/* Metrics Dashboard Grid (3 Cards) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Joylangan kitoblar */}
        <div
          id="profile-stat-my-listings"
          onClick={onGoToMyListings}
          className="p-4 sm:p-5 rounded-2xl bg-stone-50/50 dark:bg-zinc-900/50 border border-stone-200 dark:border-zinc-800 shadow-sm hover:border-stone-400 dark:hover:border-zinc-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-[#141413] dark:text-stone-100 border border-stone-200/60 dark:border-zinc-700/60">
              <BookMarked className="w-4 h-4 stroke-[1.8]" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-3">
            <div id="profile-stat-my-listings-count" className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {myListingsCount}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
              Joylangan kitoblar
            </div>
          </div>
        </div>

        {/* Card 2: Almashilganlar */}
        <div
          id="profile-stat-swapped"
          onClick={onGoToMyListings}
          className="p-4 sm:p-5 rounded-2xl bg-stone-50/50 dark:bg-zinc-900/50 border border-stone-200 dark:border-zinc-800 shadow-sm hover:border-stone-400 dark:hover:border-zinc-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-[#141413] dark:text-stone-100 border border-stone-200/60 dark:border-zinc-700/60">
              <RefreshCw className="w-4 h-4 stroke-[1.8]" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-3">
            <div id="profile-stat-swapped-count" className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {swappedCount}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
              Almashilganlar
            </div>
          </div>
        </div>

        {/* Card 3: Saqlanganlar */}
        <div
          id="profile-stat-saved"
          onClick={onGoToSaved}
          className="p-4 sm:p-5 rounded-2xl bg-stone-50/50 dark:bg-zinc-900/50 border border-stone-200 dark:border-zinc-800 shadow-sm hover:border-stone-400 dark:hover:border-zinc-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bookmark className="w-4 h-4 stroke-[1.8]" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-3">
            <div id="profile-stat-saved-count" className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {savedCount}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
              Saqlanganlar
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial space-y-3">
        <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
          Tezkor amallar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="profile-add-book-btn"
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 transition-all text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 dark:bg-black/10 flex items-center justify-center">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">
                  + Yangi kitob joylash
                </div>
                <div className="text-[11px] text-stone-300 dark:text-stone-600">
                  Uchrashuv nuqtasi bilan
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="profile-manage-shelf-btn"
            type="button"
            onClick={onGoToMyListings}
            className="flex items-center justify-between p-4 rounded-2xl bg-stone-50/60 dark:bg-zinc-900/50 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 flex items-center justify-center shadow-xs border border-stone-200/80 dark:border-zinc-700">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  E&#39;lonlarni boshqarish
                </div>
                <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                  Holatni o&#39;zgartirish yoki o&#39;chirish
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Customer Support Card */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-amber-500/5 via-stone-50/50 to-white dark:from-amber-500/10 dark:via-zinc-900/40 dark:to-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>Qoʻllab-quvvatlash va Takliflar</span>
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Savol yoki takliflaringiz bormi?
            </h4>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-md">
              Kitto boʻyicha qandaydir savol, fikr yoki takliflaringiz boʻlsa, biz bilan bevosita bogʻlaning.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenSupport && (
              <button
                type="button"
                onClick={onOpenSupport}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 font-semibold text-xs shadow-xs transition-all active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Batafsil</span>
              </button>
            )}
            <a
              href={`https://t.me/${SUPPORT_TELEGRAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@{SUPPORT_TELEGRAM}</span>
            </a>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{SUPPORT_PHONE}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Brand Attribution Footer */}
      <div className="pt-4 pb-2 text-center">
        <p className="text-xs font-medium text-stone-500 dark:text-zinc-400">
          Kitto © 2026 — Kitobxonlar hamjamiyati
        </p>
      </div>
    </div>
  );
};
