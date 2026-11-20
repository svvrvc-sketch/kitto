'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeftRight,
  Bookmark,
  Compass,
  User as UserIcon,
  Plus,
  ShieldCheck,
  MapPin,
  Phone,
  Send,
  Edit3,
  Camera,
  Trash2,
  RotateCcw,
  Clock,
  Check,
  X,
  Menu,
  QrCode,
  Search,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { Book } from '@/types/book';
import { booksService, exchangeTransactionsService, profilesService } from '@/services/db';
import { uploadImageToStorage } from '@/utils/storage';
import { isValidUzbekPhone, formatUzbekPhone, formatLocalPhone, getUzbekOperator, extractUzbek9Digits } from '@/utils/phone';
import { UZBEKISTAN_REGIONS, normalizeRegionName } from '@/lib/regions';
import { Sidebar } from '@/components/Sidebar';
import { SwapQRModal } from '@/components/SwapQRModal';

const GENRE_CHIPS = [
  'Badiiy adabiyot',
  'Jahon adabiyoti',
  'Biznes va moliya',
  'Shaxsiy rivojlanish',
  'Psixologiya',
  'IT va dasturlash',
  'Tarix va falsafa',
  'Bolalar adabiyoti',
  'Ilmiy-ommabop',
  'Detektiv va triller',
  'Fantastika',
  'Sheʼriyat',
];

function CabinetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') || 'my_books';
  const activeTab = ['my_books', 'swaps', 'wishlist', 'genres', 'profile'].includes(rawTab)
    ? rawTab
    : 'my_books';

  const { user, isAuthenticated, updateProfile, logout, openAuthModal, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [allExchangeTransactions, setAllExchangeTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editCity, setEditCity] = useState('Toshkent shahri');
  const [editTelegram, setEditTelegram] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Wishlist state
  const [wishlistInput, setWishlistInput] = useState('');

  // My Books Search & Filter State
  const [myBooksSearchQuery, setMyBooksSearchQuery] = useState('');
  const [myBooksFilterStatus, setMyBooksFilterStatus] = useState<'all' | 'active' | 'swapped' | 'temporarily_given'>('all');

  // Filtered My Books
  const filteredMyBooks = useMemo(() => {
    let list = myBooks;
    if (myBooksFilterStatus === 'active') {
      list = list.filter((b) => b.status === 'active');
    } else if (myBooksFilterStatus === 'swapped') {
      list = list.filter((b) => b.status === 'swapped');
    } else if (myBooksFilterStatus === 'temporarily_given') {
      list = list.filter((b) => b.status === 'temporarily_given');
    }
    if (myBooksSearchQuery.trim()) {
      const q = myBooksSearchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q))
      );
    }
    return list;
  }, [myBooks, myBooksFilterStatus, myBooksSearchQuery]);

  // Gamified User Tier
  const userTier = useMemo(() => {
    const count = myBooks.length;
    if (count >= 8) {
      return {
        name: 'Mutolaa Ustasi',
        icon: '👑',
        color: 'text-amber-800 dark:text-amber-300 bg-amber-500/15 border-amber-500/30',
      };
    }
    if (count >= 3) {
      return {
        name: 'Faol Kitobxon',
        icon: '📚',
        color: 'text-sky-800 dark:text-sky-300 bg-sky-500/15 border-sky-500/30',
      };
    }
    return {
      name: 'Yangi Kitobxon',
      icon: '🌱',
      color: 'text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    };
  }, [myBooks.length]);

  // QR Modal
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrSelectedBook, setQrSelectedBook] = useState<Book | null>(null);
  const [qrModalMode, setQrModalMode] = useState<'handover' | 'return'>('handover');

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      if (user.contact && !user.contact.includes('@')) {
        setEditContact(extractUzbek9Digits(user.contact));
      } else {
        setEditContact('');
      }
      setEditCity(user.city ? normalizeRegionName(user.city) : 'Toshkent shahri');
      setEditTelegram(user.telegramUsername ? user.telegramUsername.replace(/^@/, '') : '');
      setEditAge(user.age ? String(user.age) : '');
      setEditBio(user.bio || '');
    }
  }, [user]);

  // Load books & transactions
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      setLoading(true);
      Promise.all([
        booksService.getBooks(),
        exchangeTransactionsService.getTransactions(user.id),
      ])
        .then(([books, txns]) => {
          if (!isMounted) return;
          const userBooks = books.filter((b) => b.ownerId === user.id);
          setMyBooks(userBooks);
          setAllExchangeTransactions(txns);
        })
        .catch((err) => {
          console.warn('Error fetching cabinet data:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const setTab = (newTab: string) => {
    router.replace(`/cabinet?tab=${newTab}`, { scroll: false });
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('Faqat rasm formatidagi fayllarni yuklashingiz mumkin', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const publicUrl = await uploadImageToStorage(file, 'avatars');
      const updatedUser = {
        ...user,
        avatar: publicUrl,
        avatar_url: publicUrl,
      };
      await profilesService.upsertProfile(updatedUser);
      updateProfile(updatedUser);
      showToast('Profil rasmi muvaffaqiyatli yangilandi', 'success');
    } catch {
      showToast('Rasmni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Restore Google account original avatar
  const handleRestoreGoogleAvatar = async () => {
    if (!user) return;
    const googleAvatar = user.google_avatar_url;
    if (!googleAvatar) {
      showToast('Google hisobingizdagi rasm topilmadi', 'info');
      return;
    }
    try {
      const updatedUser = {
        ...user,
        avatar: googleAvatar,
        avatar_url: googleAvatar,
      };
      await profilesService.upsertProfile(updatedUser);
      updateProfile(updatedUser);
      showToast('Google hisobingizdagi rasm qaytarildi!', 'success');
    } catch {
      showToast('Rasmni yangilashda xatolik yuz berdi', 'error');
    }
  };

  // Remove custom avatar and reset to initials
  const handleRemoveAvatar = async () => {
    if (!user) return;
    try {
      const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=141413,27272a,3f3f46`;
      const updatedUser = {
        ...user,
        avatar: fallback,
        avatar_url: fallback,
      };
      await profilesService.upsertProfile(updatedUser);
      updateProfile(updatedUser);
      showToast('Profil rasmi tozalandi', 'info');
    } catch {
      showToast('Rasmni tozalashda xatolik yuz berdi', 'error');
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    if (!editName.trim()) {
      showToast('Iltimos, ismingizni kiriting', 'error');
      return;
    }

    const rawDigits = editContact.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length !== 9) {
      showToast('Iltimos, 9 xonali telefon raqamingizni toʻliq kiriting', 'error');
      return;
    }

    const fullPhone = `+998 ${rawDigits.substring(0, 2)} ${rawDigits.substring(2, 5)} ${rawDigits.substring(5, 7)} ${rawDigits.substring(7, 9)}`;
    if (!isValidUzbekPhone(fullPhone)) {
      showToast('Notoʻgʻri Oʻzbekiston operator kodi (masalan: 90, 91, 93, 94, 97, 98, 99, 33, 88, 77, 50, 20)', 'error');
      return;
    }

    const cleanAge = editAge.trim() ? parseInt(editAge.trim(), 10) : undefined;
    if (cleanAge !== undefined && (isNaN(cleanAge) || cleanAge < 7 || cleanAge > 110)) {
      showToast('Iltimos, haqiqiy yoshingizni kiriting (7-110)', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedUser = {
        ...user,
        name: editName.trim(),
        contact: fullPhone,
        city: editCity,
        telegramUsername: editTelegram.trim() ? `@${editTelegram.trim().replace(/^@/, '')}` : undefined,
        age: cleanAge,
        bio: editBio.trim() || undefined,
      };

      await profilesService.upsertProfile(updatedUser);
      updateProfile(updatedUser);
      setIsEditingProfile(false);
      showToast('Profil maʼlumotlari muvaffaqiyatli saqlandi!', 'success');
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast('Profilni saqlashda xatolik yuz berdi', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Genre selection
  const handleToggleGenre = (genre: string) => {
    const current = user?.favoriteGenres || [];
    const updated = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    updateProfile({ favoriteGenres: updated });
  };

  // Wishlist
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
      showToast("Ushbu kitob allaqachon ro'yxatda bor", 'info');
      return;
    }
    const updated = [...current, trimmed];
    updateProfile({ wishlistBooks: updated });
    setWishlistInput('');
    showToast(`"${trimmed}" istaklar ro'yxatiga qo'shildi`, 'success');
  };

  const handleRemoveWishlistBook = (item: string) => {
    const current = user?.wishlistBooks || [];
    const updated = current.filter((b) => b !== item);
    updateProfile({ wishlistBooks: updated });
  };

  // Delete book
  const handleDeleteBook = async (bookId: string) => {
    if (confirm("Ushbu kitobni o'chirishni xohlaysizmi?")) {
      try {
        await booksService.deleteBook(bookId);
        setMyBooks((prev) => prev.filter((b) => b.id !== bookId));
        showToast("Kitob o'chirildi", 'info');
      } catch {
        showToast("Kitobni o'chirishda xatolik yuz berdi", 'error');
      }
    }
  };

  // QR Handover
  const handleOpenQRModal = (book: Book, mode: 'handover' | 'return') => {
    setQrSelectedBook(book);
    setQrModalMode(mode);
    setIsQRModalOpen(true);
  };

  // Stats calculation
  const activeCount = myBooks.filter((b) => b.status === 'active' || (b.status as string) === 'available').length;
  const swappedCount = myBooks.filter((b) => b.status === 'swapped' || Boolean(b.isCompleted)).length;
  const lentBooks = myBooks.filter((b) => b.status === 'temporarily_given');

  const getDaysRemaining = (dueAt?: string) => {
    if (!dueAt) return 0;
    const diffMs = new Date(dueAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // Unauthenticated view
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mx-auto mb-4 border border-stone-200 dark:border-stone-700">
            <UserIcon className="w-8 h-8 stroke-[1.6]" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Shaxsiy kabinet
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            O&#39;z javoningizdagi kitoblarni boshqarish, almashuvlarni kuzatish va xabarlarni ko&#39;rish uchun tizimga kiring.
          </p>

          <button
            onClick={() => loginWithGoogle().catch(() => openAuthModal())}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all"
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

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Asosiy do&#39;konga qaytish</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>15 kunlik xavfsiz sessiya kafolatlangan</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* Main Content Pane */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#FAF9F5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
              title="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-sans text-lg font-bold">Shaxsiy kabinet</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
              title="Do'konga qaytish"
            >
              <Compass className="w-4 h-4" />
            </Link>
            <Link
              href="/add-book"
              className="p-2 rounded-xl bg-amber-600 text-white shadow-xs"
              title="Kitob qo'shish"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Identity Header Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                {/* Avatar with live upload button */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="relative shrink-0 group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-stone-200 dark:border-zinc-700 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-600 text-white font-sans font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-sm">
                      {(user.name || 'K').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 rounded-2xl bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                    title="Rasmni o'zgartirish"
                  >
                    <Camera className="w-5 h-5 drop-shadow-md" />
                  </button>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-white shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Name & Contact Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-sans text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">
                      {user.name}
                    </h1>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold shadow-2xs ${userTier.color}`}>
                      <span>{userTier.icon}</span>
                      <span>{userTier.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{user.trustScore ?? 1} ball</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-stone-600 dark:text-zinc-400">
                    <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{user.contact || 'Telefon kiritilmagan'}</span>
                    </span>
                    {user.telegramUsername && (
                      <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1">
                        <Send className="w-3.5 h-3.5 text-sky-500" />
                        <span>@{user.telegramUsername.replace(/^@/, '')}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{user.city ? normalizeRegionName(user.city) : 'Toshkent shahri'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-all active:scale-95 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Yopish' : 'Tahrirlash'}</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Chiqish"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline Profile Edit Form */}
            {isEditingProfile && (
              <form onSubmit={handleSaveProfile} className="mt-6 pt-5 border-t border-stone-100 dark:border-zinc-800 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Ism va familiya *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Telefon raqam (majburiy) *
                    </label>
                    <div className="flex items-center rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 overflow-hidden focus-within:ring-1 focus-within:ring-stone-900 transition-all">
                      <div className="px-3 py-2 bg-stone-100 dark:bg-zinc-700/60 text-xs font-bold text-stone-600 dark:text-stone-300 border-r border-stone-200 dark:border-zinc-700 shrink-0 select-none">
                        +998
                      </div>
                      <input
                        type="tel"
                        required
                        value={formatLocalPhone(editContact)}
                        onChange={(e) => {
                          setEditContact(extractUzbek9Digits(e.target.value));
                        }}
                        placeholder="90 123 45 67"
                        maxLength={12}
                        className="w-full px-3 py-2 bg-transparent text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Telegram username (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      value={editTelegram}
                      onChange={(e) => setEditTelegram(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      Hudud *
                    </label>
                    <select
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    >
                      {UZBEKISTAN_REGIONS.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-stone-100 dark:border-zinc-800">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  Faol kitoblarim
                </div>
                <div className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {activeCount} ta
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  Almashilgan
                </div>
                <div className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {swappedCount} ta
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  Mutolaada
                </div>
                <div className="font-sans text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                  {lentBooks.length} ta
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  Ishonch nishoni
                </div>
                <div className="font-sans text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ishonchli kitobxon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs Bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-200/70 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setTab('my_books')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'my_books'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/60 dark:border-stone-700/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Mening javonim ({myBooks.length})</span>
            </button>

            <button
              onClick={() => setTab('swaps')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'swaps'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/60 dark:border-stone-700/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Almashuvlar & Mutolaa {lentBooks.length > 0 && `(${lentBooks.length})`}</span>
            </button>

            <button
              onClick={() => setTab('wishlist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/60 dark:border-stone-700/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Istaklarim ({user.wishlistBooks?.length || 0})</span>
            </button>

            <button
              onClick={() => setTab('genres')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'genres'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/60 dark:border-stone-700/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Qiziqqan janrlar</span>
            </button>

            <button
              onClick={() => setTab('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/60 dark:border-stone-700/60'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <UserIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Profil sozlamalari</span>
            </button>
          </div>

          {/* TAB 1: MENING JAVONIM */}
          {activeTab === 'my_books' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-sans text-lg font-bold">Mening kitoblarim</h2>
                  <p className="text-xs text-stone-500">Siz joylashtirgan barcha faol va yakunlangan kitoblar</p>
                </div>
                <Link
                  href="/add-book"
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi kitob</span>
                </Link>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={myBooksSearchQuery}
                    onChange={(e) => setMyBooksSearchQuery(e.target.value)}
                    placeholder="Javondan kitob qidirish..."
                    className="w-full pl-8 pr-7 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {myBooksSearchQuery && (
                    <button
                      onClick={() => setMyBooksSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setMyBooksFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      myBooksFilterStatus === 'all'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    Barchasi ({myBooks.length})
                  </button>
                  <button
                    onClick={() => setMyBooksFilterStatus('active')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      myBooksFilterStatus === 'active'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    Faol ({activeCount})
                  </button>
                  <button
                    onClick={() => setMyBooksFilterStatus('swapped')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      myBooksFilterStatus === 'swapped'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    Almashilgan ({swappedCount})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-200 dark:bg-zinc-800" />
                  ))}
                </div>
              ) : filteredMyBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMyBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Book Cover */}
                        <Link href={`/book/${book.id}`} className="block relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 mb-2.5 border border-stone-200/60 dark:border-zinc-700 shadow-2xs">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <BookOpen className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                            {book.swapTerm?.type === 'gift'
                              ? 'Hadya'
                              : book.swapTerm?.type === 'temporary'
                              ? 'Vaqtincha'
                              : 'Almashuv'}
                          </div>
                        </Link>

                        <Link href={`/book/${book.id}`} className="block">
                          <h3 className="font-sans text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                            {book.title}
                          </h3>
                          <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                            {book.author}
                          </p>
                        </Link>
                      </div>

                      {/* Controls */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleOpenQRModal(book, 'handover')}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 border border-amber-200/80 dark:border-amber-900/50"
                          title="QR-kod orqali topshirish"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR topshirish</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-600 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-center">
                  <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-3 stroke-[1.5]" />
                  <h3 className="font-sans text-base font-bold text-stone-900 dark:text-stone-100">
                    {myBooksSearchQuery ? 'Ushbu qidiruv bo‘yicha kitob topilmadi' : 'Javoningizda hali kitoblar yoʻq'}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
                    {myBooksSearchQuery
                      ? 'Boshqa kalit so‘z bilan qidiring yoki filtrlarni tozalang.'
                      : 'Oʻzingiz oʻqib boʻlgan kitoblarni joylang va boshqa kitobxonlar bilan doimiy yoki vaqtincha almashing.'}
                  </p>
                  {myBooksSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMyBooksSearchQuery('');
                        setMyBooksFilterStatus('all');
                      }}
                      className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 font-semibold text-xs"
                    >
                      Filtrni tozalash
                    </button>
                  ) : (
                    <Link
                      href="/add-book"
                      className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Birinchi kitobni joylash</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALMASHUVLAR & MUTOLAA */}
          {activeTab === 'swaps' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Vaqtincha mutolaadagi kitoblar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-base font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Vaqtincha berilgan kitoblar (Lending Tracker)</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Boshqa kitobxonlarga vaqtincha mutolaaga berilgan kitoblar va ularning qaytish muddatlari
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {lentBooks.length} ta
                  </span>
                </div>

                {lentBooks.length > 0 ? (
                  <div className="space-y-3">
                    {lentBooks.map((book) => {
                      const daysLeft = getDaysRemaining(book.loanInfo?.dueAt);
                      return (
                        <div
                          key={book.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-zinc-800 shrink-0 border border-black/10">
                              {book.coverUrl ? (
                                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-sans text-sm font-bold truncate text-stone-900 dark:text-stone-100">
                                {book.title}
                              </h4>
                              <p className="text-xs text-stone-500 dark:text-zinc-400 truncate">
                                {book.author}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{daysLeft > 0 ? `${daysLeft} kun qoldi` : 'Muddat tugagan!'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenQRModal(book, 'return')}
                            className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Qaytarib olishni tasdiqlash</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic py-3 text-center">
                    Hozircha vaqtincha berilgan kitoblar mavjud emas.
                  </p>
                )}
              </div>

              {/* Tranzaksiyalar tarixi */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-base font-bold flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      <span>Almashuv takliflari tarixi</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Supabase bulutida saqlangan barcha P2P almashuv arizalari
                    </p>
                  </div>
                  <Link
                    href="/messages"
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Xabarlarga o&#39;tish</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {allExchangeTransactions.length > 0 ? (
                  <div className="space-y-2.5">
                    {allExchangeTransactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            Tranzaksiya #{txn.id.slice(-6)}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Sana: {new Date(txn.created_at || Date.now()).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            txn.status === 'accepted' || txn.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : txn.status === 'declined'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {txn.status === 'accepted'
                            ? 'Qabul qilingan'
                            : txn.status === 'completed'
                            ? 'Yakunlangan'
                            : txn.status === 'declined'
                            ? 'Rad etilgan'
                            : 'Kutilmoqda'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic py-3 text-center">
                    Hozircha almashuv takliflari yo&#39;q.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ISTAKLARIM (WISHLIST) */}
          {activeTab === 'wishlist' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-base font-bold flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Qidirayotgan kitoblarim (Wishlist)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    O&#39;qishni istagan kitoblaringizni kiriting. Boshqa kitobxonlar sizning profilingizda ularni ko&#39;rib, o&#39;zaro almashishni taklif qilishadi.
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-500">
                  {(user.wishlistBooks || []).length}/6 ta
                </span>
              </div>

              {/* Add Input */}
              <form onSubmit={handleAddWishlistBook} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={wishlistInput}
                  onChange={(e) => setWishlistInput(e.target.value)}
                  placeholder="Kitob nomi va muallifini kiriting (masalan: Alkimyogar - Paolo Koelo)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                  type="submit"
                  disabled={!wishlistInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs shadow-xs disabled:opacity-40"
                >
                  + Qo&#39;shish
                </button>
              </form>

              {/* List */}
              {(user.wishlistBooks || []).length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-3">
                  {(user.wishlistBooks || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWishlistBook(item)}
                        className="p-0.5 rounded-md hover:bg-amber-200/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-400"
                        title="O'chirish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic py-4 text-center">
                  Hozircha birorta kitob qo&#39;shilmagan. Yuqoridagi maydonga yozib qo&#39;shing!
                </p>
              )}
            </div>
          )}

          {/* TAB 4: QIZIQQAN JANRLAR */}
          {activeTab === 'genres' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-sans text-base font-bold flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Qiziqqan janrlarim</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Sizga mos kitoblarni tavsiya qilishimiz uchun sevimli adabiyot yoʻnalishlaringizni tanlang.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {GENRE_CHIPS.map((genre) => {
                  const isSelected = (user.favoriteGenres || []).includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleToggleGenre(genre)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border active:scale-95 ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      {genre}
                      {isSelected && <Check className="w-3.5 h-3.5 ml-1.5 inline-block stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PROFIL SOZLAMALARI */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="font-sans text-lg sm:text-xl font-bold flex items-center gap-2.5 text-stone-900 dark:text-stone-100">
                  <UserIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Profil sozlamalari</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Shaxsiy maʼlumotlaringiz, avataringiz va boshqa kitobxonlar bilan bogʻlanish kontaktlarini boshqaring.
                </p>
              </div>

              {/* Avatar Management Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-stone-200 dark:bg-stone-700">
                    <img
                      src={user.avatar || user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-md border-2 border-white dark:border-stone-900 transition-transform active:scale-90"
                    title="Yangi rasm yuklash"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    Profil suratingiz
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
                    Suratingiz kitob almashuvlarida va suhbatlarda boshqa kitobxonlarga koʻrinadi.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploadingAvatar ? 'Yuklanmoqda...' : 'Yangi rasm yuklash'}</span>
                    </button>

                    {user.google_avatar_url && (
                      <button
                        type="button"
                        onClick={handleRestoreGoogleAvatar}
                        className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-all active:scale-95"
                        title="Google hisobingizdagi asl rasmni qaytarish"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Google rasmini tiklash</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-all active:scale-95"
                      title="Maxsus rasmni o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Tozalash</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ism familiya */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Ism va familiyangiz <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Masalan: Zuxriddin Hasanov"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                    />
                  </div>

                  {/* Telefon */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Telefon raqam <span className="text-amber-500">*</span>
                      </label>
                      {getUzbekOperator(editContact) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                          {getUzbekOperator(editContact)?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-500 overflow-hidden transition-all">
                      <div className="px-3.5 py-2.5 bg-stone-100 dark:bg-stone-700/60 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 border-r border-stone-200 dark:border-stone-700 shrink-0 select-none">
                        +998
                      </div>
                      <input
                        type="tel"
                        required
                        value={formatLocalPhone(editContact)}
                        onChange={(e) => {
                          setEditContact(extractUzbek9Digits(e.target.value));
                        }}
                        placeholder="90 123 45 67"
                        maxLength={12}
                        className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Telegram */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Telegram username (bogʻlanish uchun)
                    </label>
                    <div className="flex items-center rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-500 overflow-hidden transition-all">
                      <span className="pl-3.5 text-stone-400 font-bold text-xs select-none">@</span>
                      <input
                        type="text"
                        value={editTelegram}
                        onChange={(e) => setEditTelegram(e.target.value.replace(/^@/, ''))}
                        placeholder="username"
                        className="w-full px-2 py-2.5 bg-transparent text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Yoshi */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Yoshingiz
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={110}
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      placeholder="Masalan: 22"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                    />
                  </div>

                  {/* Viloyat */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Viloyat / Shahar <span className="text-amber-500">*</span>
                    </label>
                    <select
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all cursor-pointer"
                    >
                      {UZBEKISTAN_REGIONS.map((r) => (
                        <option key={r.id} value={r.name} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      Oʻzingiz haqingizda (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Kitoblar, sevimli mualliflaringiz yoki mutolaa maqsadlaringiz haqida qisqacha yozing..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-3 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <span className="animate-pulse">Saqlanmoqda...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Oʻzgarishlarni saqlash</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <BottomNav savedCount={user.wishlistBooks?.length || 0} />
      </div>

      {/* QR Code Handover & Return Modal */}
      {isQRModalOpen && qrSelectedBook && (
        <SwapQRModal
          isOpen={isQRModalOpen}
          book={qrSelectedBook}
          mode={qrModalMode}
          onClose={() => setIsQRModalOpen(false)}
          onConfirmSuccess={(bookId, newStatus) => {
            setMyBooks((prev) =>
              prev.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b))
            );
          }}
        />
      )}
    </div>
  );
}

export default function CabinetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 flex items-center justify-center">
          <div className="animate-pulse font-sans text-lg text-stone-600">Kabinet yuklanmoqda...</div>
        </div>
      }
    >
      <CabinetContent />
    </Suspense>
  );
}
