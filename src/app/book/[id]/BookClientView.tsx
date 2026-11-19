'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Share2,
  ShieldCheck,
  ArrowLeftRight,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/context/ToastContext';
import { Book } from '@/types/book';
import { booksService } from '@/services/db';
import { SwapRequestModal } from '@/components/exchange/SwapRequestModal';
import { LogoIcon } from '@/components/Logo';

interface BookClientViewProps {
  initialBook: Book | null;
  bookId: string;
}

export const BookClientView: React.FC<BookClientViewProps> = ({ initialBook, bookId }) => {
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal, loginWithGoogle } = useAuth();
  const { startConversation } = useChat();
  const { showToast } = useToast();

  const [book, setBook] = useState<Book | null>(initialBook);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Load latest book details if not present or refreshed
  useEffect(() => {
    booksService.getBooks().then((books) => {
      setAllBooks(books);
      const found = books.find((b) => b.id === bookId);
      if (found) setBook(found);
    });

    if (typeof window !== 'undefined') {
      try {
        const savedRaw = localStorage.getItem('kitto_saved_books') || '[]';
        const savedList = JSON.parse(savedRaw);
        if (Array.isArray(savedList)) {
          setIsSaved(savedList.includes(bookId));
        }
      } catch {
        // ignore
      }
    }
  }, [bookId]);

  const toggleSave = () => {
    try {
      const savedRaw = localStorage.getItem('kitto_saved_books') || '[]';
      let savedList: string[] = JSON.parse(savedRaw);
      if (!Array.isArray(savedList)) savedList = [];

      if (savedList.includes(bookId)) {
        savedList = savedList.filter((id) => id !== bookId);
        setIsSaved(false);
        showToast("Kitob xatcho'plardan o'chirildi", 'info');
      } else {
        savedList.push(bookId);
        setIsSaved(true);
        showToast("Kitob xatcho'plarga saqlandi", 'success');
      }
      localStorage.setItem('kitto_saved_books', JSON.stringify(savedList));
    } catch {
      // ignore
    }
  };

  const handleStartChat = () => {
    if (!book) return;
    if (!isAuthenticated) {
      openAuthModal('Xabar yozish uchun tizimga kiring');
      return;
    }
    const threadId = startConversation(book, `Salom! Sizning "${book.title}" kitobingiz bo'yicha bog'lanmoqdaman.`);
    router.push(`/messages?thread=${threadId}`);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://kitto-fakv.vercel.app/book/${bookId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: book?.title || 'Kitto.uz',
          text: `Kitto.uz orqali kitob almashing: ${book?.title} (${book?.author})`,
          url,
        });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Havola nusxalandi!', 'success');
    }
  };

  const isOwner = user?.id && book?.ownerId && user.id === book.ownerId;

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {/* Clean Store Header */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-xl bg-amber-600 text-white shadow-xs">
                <LogoIcon size={20} />
              </div>
              <span className="font-serif text-lg font-bold">Kitto</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Do&#39;konga qaytish</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <Link
                href="/cabinet"
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold"
              >
                Kabinetim
              </Link>
            ) : (
              <button
                onClick={() => loginWithGoogle()}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold"
              >
                Kirish
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 min-h-screen">
        {/* Book Details Container */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {book ? (
            <div className="space-y-8">
              {/* Main Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] w-48 sm:w-60 rounded-2xl overflow-hidden shadow-book border border-stone-200 dark:border-zinc-700 bg-stone-100 shrink-0 mx-auto sm:mx-0">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                      {book.swapTerm?.type === 'gift'
                        ? 'Bepul hadya'
                        : book.swapTerm?.type === 'temporary'
                        ? `Vaqtincha (${book.swapTerm?.durationLabel || 'Oʻqishga'})`
                        : 'Doimiy almashuv'}
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-2">
                        <span>{book.category || 'Badiiy adabiyot'}</span>
                        <span>•</span>
                        <span>Holati: {book.condition || 'Yaxshi'}</span>
                      </div>

                      <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                        {book.title}
                      </h1>
                      <p className="text-sm sm:text-base font-medium text-stone-500 dark:text-zinc-400 mt-1">
                        {book.author}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-zinc-400">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{book.location?.addressText || book.city || 'Toshkent shahri'}</span>
                    </div>

                    {book.description && (
                      <div className="pt-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">
                          Tavsif
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                          {book.description}
                        </p>
                      </div>
                    )}

                    {book.swapTerm?.returnConditionNote && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Egasining eslatmasi: </span>
                        <span>{book.swapTerm.returnConditionNote}</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      {!isOwner ? (
                        <>
                          <button
                            onClick={() => setIsSwapModalOpen(true)}
                            className="flex-1 sm:flex-initial py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                          >
                            <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
                            <span>Almashishni taklif qilish</span>
                          </button>

                          <button
                            onClick={handleStartChat}
                            className="py-3 px-5 rounded-2xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
                          >
                            <MessageSquare className="w-4 h-4 text-stone-500" />
                            <span>Xabar yozish</span>
                          </button>
                        </>
                      ) : (
                        <div className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-semibold text-stone-600 dark:text-stone-300">
                          Bu sizning kitobingiz
                        </div>
                      )}

                      <button
                        onClick={toggleSave}
                        className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                          isSaved
                            ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800'
                            : 'border-stone-200 dark:border-zinc-700 hover:bg-stone-50 text-stone-500'
                        }`}
                        title={isSaved ? "Xatcho'plardan o'chirish" : "Xatcho'plarga saqlash"}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleShare}
                        className="p-3 rounded-2xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 text-stone-500 transition-all active:scale-95"
                        title="Ulashish"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Info Card */}
              {book.ownerId && (
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial flex items-center justify-between gap-4">
                  <Link
                    href={`/user/${book.ownerId}`}
                    className="flex items-center gap-3.5 hover:opacity-85 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0">
                      {(book.ownerName || 'K').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                          {book.ownerName || 'Kitobxon'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          <span>Ishonchli</span>
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Kitob egasining barcha javonini koʻrish
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`/user/${book.ownerId}`}
                    className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    Profilni koʻrish
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80">
              <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-40" />
              <h2 className="font-serif text-lg font-bold mb-1">Kitob topilmadi</h2>
              <p className="text-xs text-stone-500 mb-6">
                Ushbu kitob oʻchirilgan yoki allaqachon muvaffaqiyatli almashilgan boʻlishi mumkin.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-[#141413] text-white text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Bosh sahifaga qaytish</span>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Swap Request Modal */}
      {isSwapModalOpen && book && (
        <SwapRequestModal
          isOpen={isSwapModalOpen}
          targetBook={book}
          allBooks={allBooks}
          onClose={() => setIsSwapModalOpen(false)}
          onSwapSubmitted={(txnId, threadId) => {
            router.push(`/messages?thread=${threadId}`);
          }}
        />
      )}
    </div>
  );
};
