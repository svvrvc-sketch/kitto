'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  BookOpen,
  ArrowLeftRight,
  Bookmark,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { profilesService, booksService } from '@/services/db';
import { UserProfile } from '@/types/auth';
import { Book } from '@/types/book';
import { normalizeRegionName } from '@/lib/regions';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { SwapRequestModal } from '@/components/exchange/SwapRequestModal';

function UserProfileContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const { user: currentUser } = useAuth();
  const { startConversation } = useChat();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Swap modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedTargetBook, setSelectedTargetBook] = useState<Book | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (userId) {
      setLoading(true);
      Promise.all([
        profilesService.getProfile(userId),
        booksService.getBooks(),
      ])
        .then(([p, books]) => {
          if (!isMounted) return;
          if (p) setProfile(p);
          setAllBooks(books);
          const uBooks = books.filter((b) => b.ownerId === userId);
          setUserBooks(uBooks);
        })
        .catch((err) => {
          console.warn('Error fetching user profile:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const activeBooks = userBooks.filter((b) => b.status === 'active' || (b.status as string) === 'available');
  const swappedCount = userBooks.filter((b) => b.status === 'swapped' || Boolean(b.isCompleted)).length;
  const isSelf = currentUser?.id === userId;

  const handleStartSwap = (book: Book) => {
    setSelectedTargetBook(book);
    setIsSwapModalOpen(true);
  };

  const handleDirectMessage = () => {
    if (activeBooks.length > 0) {
      const threadId = startConversation(activeBooks[0], 'Salom!');
      router.push(`/messages?thread=${threadId}`);
    } else {
      router.push('/messages');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse font-serif text-lg text-stone-600">Foydalanuvchi profili yuklanmoqda...</div>
      </div>
    );
  }

  const displayName = profile?.name || userBooks[0]?.ownerName || 'Kitobxon';
  const displayCity = profile?.city || userBooks[0]?.city || 'Toshkent shahri';
  const displayAvatar = profile?.avatar || profile?.avatar_url;
  const wishlist = profile?.wishlistBooks || userBooks[0]?.ownerWishlist || [];
  const genres = profile?.favoriteGenres || userBooks[0]?.ownerFavoriteGenres || [];

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100 flex flex-col">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#FAF9F5]/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-serif text-lg font-bold">Kitobxon profili</div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-zinc-800 text-stone-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Content Pane */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <button
            onClick={() => router.back()}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Orqaga</span>
          </button>

          {/* User Hero Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-stone-200 dark:border-zinc-700 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141413] text-white dark:bg-stone-100 dark:text-[#141413] font-serif font-bold text-2xl flex items-center justify-center shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-serif text-xl sm:text-2xl font-bold truncate">
                      {displayName}
                    </h1>
                    {isSelf && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200">
                        Siz
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Ishonch: {profile?.trustScore ?? 1} ball</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{normalizeRegionName(displayCity)}</span>
                    </span>
                    <span>•</span>
                    <span>{activeBooks.length} ta faol kitob</span>
                  </div>
                </div>
              </div>

              {!isSelf && (
                <button
                  onClick={handleDirectMessage}
                  className="px-5 py-2.5 rounded-xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-xs transition-all active:scale-95 self-start sm:self-center"
                >
                  Xabar yozish
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800 text-center">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                <div className="text-[10px] font-bold uppercase text-stone-500">Faol kitoblari</div>
                <div className="font-serif text-lg font-bold mt-0.5">{activeBooks.length} ta</div>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                <div className="text-[10px] font-bold uppercase text-stone-500">Almashilgan</div>
                <div className="font-serif text-lg font-bold mt-0.5">{swappedCount} ta</div>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                <div className="text-[10px] font-bold uppercase text-stone-500">Ishonchli kitobxon</div>
                <div className="font-serif text-lg font-bold text-emerald-600 mt-0.5">Faol</div>
              </div>
            </div>
          </div>

          {/* Wishlist Section (What this owner wants!) */}
          {wishlist.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="font-serif text-base font-bold">
                  {displayName} qidirayotgan kitoblar (Wishlist)
                </h2>
              </div>
              <p className="text-xs text-stone-500">
                Ushbu kitoblardan biri sizda boʻlsa, almashish ehtimoli ancha yuqori boʻladi!
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {wishlist.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Genres Section */}
          {genres.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 space-y-2">
              <h2 className="font-serif text-sm font-bold text-stone-700 dark:text-stone-300">
                Sevimli janrlar
              </h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User Bookshelf Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold">
                  {displayName}ning kitob javoni ({activeBooks.length})
                </h2>
                <p className="text-xs text-stone-500">Ushbu kitobxon bilan almashishingiz mumkin boʻlgan kitoblar</p>
              </div>
            </div>

            {activeBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
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
                        <h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                          {book.author}
                        </p>
                      </Link>
                    </div>

                    {!isSelf && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800">
                        <button
                          onClick={() => handleStartSwap(book)}
                          className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>Almashish</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 text-center text-stone-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Ushbu foydalanuvchida hozircha faol kitoblar yoʻq.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Swap Request Modal */}
      {isSwapModalOpen && selectedTargetBook && (
        <SwapRequestModal
          isOpen={isSwapModalOpen}
          targetBook={selectedTargetBook}
          allBooks={allBooks}
          onClose={() => setIsSwapModalOpen(false)}
          onSwapSubmitted={(txnId, threadId) => {
            router.push(`/messages?thread=${threadId}`);
          }}
        />
      )}
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 flex items-center justify-center">
          <div className="animate-pulse font-serif text-lg text-stone-600">Yuklanmoqda...</div>
        </div>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}
