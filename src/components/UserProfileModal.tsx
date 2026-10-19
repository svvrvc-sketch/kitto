'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Book } from '@/types/book';
import { UserProfile } from '@/types/auth';
import { profilesService } from '@/services/db';
import {
  X,
  MapPin,
  BookOpen,
  Sparkles,
  BookMarked,
  RefreshCw,
  Clock,
  Compass,
} from 'lucide-react';

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  currentUser?: UserProfile | null;
  allBooks: Book[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectBook,
  currentUser,
  allBooks,
}) => {
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(null);

  // Fetch live public profile from Supabase Cloud
  useEffect(() => {
    if (isOpen && userId) {
      profilesService
        .getProfile(userId)
        .then((profile) => {
          if (profile) setFetchedProfile(profile);
        })
        .catch(() => {});
    } else {
      setFetchedProfile(null);
    }
  }, [isOpen, userId]);
  // Lock body scroll and close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Aggregate user details and books from in-memory allBooks or localStorage
  const userBooks = useMemo(() => {
    if (!userId) return [];
    let list = allBooks.filter((b) => b.ownerId === userId);
    if (list.length === 0 && typeof window !== 'undefined') {
      try {
        const raw =
          localStorage.getItem('kitto_books') ||
          localStorage.getItem('bookswap_books');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list = parsed.filter((b: Book) => b.ownerId === userId);
          }
        }
      } catch {
        // ignore
      }
    }
    return list;
  }, [allBooks, userId]);

  const isSelf = Boolean(
    (currentUser && currentUser.id === userId) ||
      (typeof window !== 'undefined' &&
        (() => {
          try {
            const stored =
              localStorage.getItem('kitto_user') ||
              localStorage.getItem('bookswap_user');
            if (stored) {
              const parsed = JSON.parse(stored);
              return parsed?.id === userId;
            }
          } catch {
            // ignore
          }
          return false;
        })())
  );

  if (!isOpen || !userId) return null;

  const firstBook = userBooks[0];

  const userName = isSelf
    ? currentUser?.name || 'Kitobxon'
    : fetchedProfile?.name || firstBook?.ownerName || 'Kitobxon';

  const userContact = isSelf
    ? currentUser?.contact || ''
    : fetchedProfile?.contact || firstBook?.ownerContact || '';

  const userCity = isSelf
    ? currentUser?.city || 'Toshkent'
    : fetchedProfile?.city || firstBook?.city || 'Toshkent';

  const userAvatar = isSelf
    ? currentUser?.avatar
    : fetchedProfile?.avatar || fetchedProfile?.avatar_url;

  // Aggregate genres and wishlist from profile or non-empty book records
  const bookWithGenres = userBooks.find(
    (b) => b.ownerFavoriteGenres && b.ownerFavoriteGenres.length > 0
  );
  const favoriteGenres = isSelf
    ? currentUser?.favoriteGenres || []
    : fetchedProfile?.favoriteGenres && fetchedProfile.favoriteGenres.length > 0
    ? fetchedProfile.favoriteGenres
    : bookWithGenres?.ownerFavoriteGenres || firstBook?.ownerFavoriteGenres || [];

  const bookWithWishlist = userBooks.find(
    (b) => b.ownerWishlist && b.ownerWishlist.length > 0
  );
  const wishlistBooks = isSelf
    ? currentUser?.wishlistBooks || []
    : fetchedProfile?.wishlistBooks && fetchedProfile.wishlistBooks.length > 0
    ? fetchedProfile.wishlistBooks
    : bookWithWishlist?.ownerWishlist || firstBook?.ownerWishlist || [];

  const activeCount = userBooks.filter((b) => b.status === 'active').length;
  const swappedCount = userBooks.filter(
    (b) => b.status === 'swapped' || Boolean(b.isCompleted)
  ).length;
  const temporarilyGivenCount = userBooks.filter(
    (b) => b.status === 'temporarily_given'
  ).length;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-md modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-5 sm:p-7 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/60 dark:border-zinc-800">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Foydalanuvchi profili</span>
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
              Kitobxon maʼlumotlari, sevimli yoʻnalishlari va joylagan kitoblari
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity & Metrics Hero */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-zinc-950/70 border border-stone-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 shadow-sm border border-stone-200 dark:border-zinc-700"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] font-serif font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-sm border border-stone-200 dark:border-zinc-700">
                {(userName || 'K').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {userName}
                </h3>
                {isSelf && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200">
                    Siz
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-600 dark:text-stone-300">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>📍 {userCity || 'Toshkent'}</span>
                </span>
                {userContact && (
                  <span className="text-stone-500 dark:text-zinc-400 truncate">
                    {userContact}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary metrics strip: Faol e'lonlar: X ta | Almashilgan: Y ta */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-stone-200/60 dark:border-zinc-800 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-stone-800 dark:text-stone-200 font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-stone-900 dark:bg-stone-100" />
              <span>Faol e&#39;lonlar: {activeCount} ta</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-stone-800 dark:text-stone-200 font-semibold shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 text-stone-500 dark:text-zinc-400" />
              <span>Almashilgan: {swappedCount} ta</span>
            </span>

            {temporarilyGivenCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 font-semibold shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Vaqtincha berilgan: {temporarilyGivenCount} ta</span>
              </span>
            )}
          </div>
        </div>

        {/* Section: Sevimli yo'nalishlar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              Sevimli yo&#39;nalishlar
            </h4>
          </div>

          {favoriteGenres.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {favoriteGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[#141413] text-[#F8F7F4] dark:bg-zinc-800 dark:text-stone-100 border border-black/10 dark:border-zinc-700 shadow-2xs"
                >
                  {genre}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 dark:text-zinc-500 italic bg-stone-50/50 dark:bg-zinc-950/40 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-800/80">
              Sevimli yo&#39;nalishlar belgilanmagan
            </p>
          )}
        </div>

        {/* Section: Qidirilayotgan kitoblar (Wishlist for Barter) */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Qidirilayotgan kitoblar
              </h4>
            </div>
            <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-sans">
              Almashuv uchun
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-tight">
            Ushbu kitobxon bilan almashish uchun taklif qilishingiz mumkin bo&#39;lgan kitoblar ro&#39;yxati:
          </p>

          {wishlistBooks.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {wishlistBooks.map((bookTitle, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs flex items-center gap-1.5"
                >
                  <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{bookTitle}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 dark:text-zinc-500 italic bg-stone-50/50 dark:bg-zinc-950/40 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-800/80">
              Hozircha qidirilayotgan kitoblar kiritilmagan
            </p>
          )}
        </div>

        {/* Section: Foydalanuvchining kitoblari */}
        <div className="mt-6 space-y-3 pt-4 border-t border-stone-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                Foydalanuvchining kitoblari ({userBooks.length})
              </h4>
            </div>
          </div>

          {userBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {userBooks.map((book) => {
                const isSwapped =
                  book.status === 'swapped' || Boolean(book.isCompleted);
                const isLent = book.status === 'temporarily_given';

                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/50 hover:bg-white dark:hover:bg-zinc-800/80 hover:border-stone-400 dark:hover:border-zinc-600 transition-all cursor-pointer group shadow-2xs"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-stone-200 dark:bg-zinc-800 book-spine-effect relative border border-black/5">
                      {book.coverUrl && !book.coverUrl.includes('unsplash.com') ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-stone-100 dark:bg-zinc-900">
                          <BookOpen className="w-4 h-4 text-stone-400 mb-0.5" />
                          <span className="font-serif text-[7px] font-bold text-stone-800 dark:text-stone-200 line-clamp-1">
                            {book.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Book text & status */}
                    <div className="min-w-0 flex-1">
                      <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {book.title}
                      </h5>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                        {book.author}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {isLent ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                            <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            <span>Vaqtincha berilgan</span>
                          </span>
                        ) : isSwapped ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700">
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Almashildi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900">
                            Faol
                          </span>
                        )}
                        <span className="text-[9px] text-stone-400 dark:text-zinc-500">
                          {book.condition || 'Yaxshi'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-400 dark:text-zinc-500 italic bg-stone-50/50 dark:bg-zinc-950/40 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-800/80">
              Ushbu foydalanuvchi hozircha kitob joylamagan
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
