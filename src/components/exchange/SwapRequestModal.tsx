'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ArrowLeftRight,
  BookOpen,
  Sparkles,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Book } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/context/ToastContext';
import { exchangeTransactionsService } from '@/services/db';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBook: Book | null;
  allBooks: Book[];
  onOpenAddModal?: () => void;
  onSwapSubmitted?: (transactionId: string, threadId: string) => void;
}

export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  targetBook,
  allBooks,
  onOpenAddModal,
  onSwapSubmitted,
}) => {
  const { user, openAuthModal } = useAuth();
  const { startConversation, sendExchangeProposal } = useChat();
  const { showToast } = useToast();

  const [selectedTargetBook, setSelectedTargetBook] = useState<Book | null>(targetBook);
  const [selectedMyBookId, setSelectedMyBookId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected target book whenever modal opens with targetBook
  useEffect(() => {
    if (targetBook) {
      setSelectedTargetBook(targetBook);
    }
  }, [targetBook]);

  // Escape key handler
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

  // Target owner's active books
  const targetOwnerBooks = useMemo(() => {
    if (!targetBook) return [];
    const ownerId = targetBook.ownerId;
    // Filter active books belonging to the target book's owner
    const list = allBooks.filter(
      (b) =>
        b.ownerId === ownerId &&
        (b.status === 'active' || (b.status as string) === 'available' || !b.status)
    );

    // Ensure the clicked targetBook is always in the list
    if (!list.some((b) => b.id === targetBook.id)) {
      list.unshift(targetBook);
    }
    return list;
  }, [allBooks, targetBook]);

  // Initiator's active books
  const myAvailableBooks = useMemo(() => {
    if (!user) return [];
    return allBooks.filter(
      (b) =>
        b.ownerId === user.id &&
        (b.status === 'active' || (b.status as string) === 'available' || !b.status)
    );
  }, [allBooks, user]);

  // Auto-select initiator's first book if not selected yet
  useEffect(() => {
    if (isOpen && myAvailableBooks.length > 0 && !selectedMyBookId) {
      setSelectedMyBookId(myAvailableBooks[0].id);
    }
  }, [isOpen, myAvailableBooks, selectedMyBookId]);

  if (!isOpen || !targetBook) return null;

  const selectedMyBook = myAvailableBooks.find((b) => b.id === selectedMyBookId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal('Kitob almashish taklifini yuborish uchun tizimga kiring');
      return;
    }

    if (!selectedTargetBook) {
      showToast('Iltimos, almashmoqchi boʻlgan kitobni tanlang', 'info');
      return;
    }

    if (!selectedMyBook) {
      showToast("Iltimos, evaziga o'z kitobingizni tanlang", 'info');
      return;
    }

    // Safety check: Cannot swap with yourself
    if (selectedTargetBook.ownerId === user.id) {
      showToast('Oʻzingizning kitobingizga almashuv taklifi yubora olmaysiz', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // 1. Record backend exchange proposal payload into exchange_transactions
      await exchangeTransactionsService.createTransaction({
        id: transactionId,
        initiator_book_id: selectedMyBook.id,
        target_book_id: selectedTargetBook.id,
        owner_id: selectedTargetBook.ownerId,
        borrower_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        initiator_book_title: selectedMyBook.title,
        target_book_title: selectedTargetBook.title,
      });

      // 2. Start or retrieve chat conversation with the target book
      const initialMessage = `Salom! Sizning "${selectedTargetBook.title}" kitobingizga oʻzimning "${selectedMyBook.title}" kitobimni almashishni taklif qilaman.`;
      const threadId = startConversation(selectedTargetBook, initialMessage);

      // 3. Dispatch rich exchange_proposal card payload directly into the chat thread
      const offeredBookMeta = {
        id: selectedMyBook.id,
        title: selectedMyBook.title,
        author: selectedMyBook.author,
        cover_url: selectedMyBook.coverUrl,
        coverUrl: selectedMyBook.coverUrl,
      };

      const requestedBookMeta = {
        id: selectedTargetBook.id,
        title: selectedTargetBook.title,
        author: selectedTargetBook.author,
        cover_url: selectedTargetBook.coverUrl,
        coverUrl: selectedTargetBook.coverUrl,
      };

      sendExchangeProposal(
        threadId,
        offeredBookMeta,
        requestedBookMeta,
        selectedTargetBook.ownerId
      );

      // 4. Dispatch Telegram Notification to the owner with both book titles explicitly stated
      try {
        fetch('/api/telegram-chat-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: selectedTargetBook.ownerId,
            recipientName: selectedTargetBook.ownerName,
            senderName: user.name || 'Kitobxon',
            bookTitle: selectedTargetBook.title,
            messageSnippet: `Yangi almashish taklifi: "${selectedMyBook.title}" ⇄ "${selectedTargetBook.title}"`,
            threadId,
          }),
        }).catch(() => {});
      } catch {
        // background non-blocking
      }

      showToast(
        `"${selectedTargetBook.title}" uchun almashish taklifingiz yuborildi!`,
        'success'
      );
      onClose();

      if (onSwapSubmitted) {
        onSwapSubmitted(transactionId, threadId);
      }
    } catch (err) {
      console.error('Failed to submit swap proposal:', err);
      showToast('Taklif yuborishda xatolik yuz berdi. Qayta urinib koʻring.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSwapTermLabel = (book: Book) => {
    if (book.swapTerm?.type === 'temporary') {
      return book.swapTerm.durationLabel || "2 haftaga o'qishga";
    }
    if (book.swapTerm?.type === 'gift') {
      return "Bepul sovg'a";
    }
    return 'Doimiy almashuv';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#F8F7F4] dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-tight">
                Kitob almashish taklifi
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                Egasi: <span className="font-medium text-stone-800 dark:text-stone-200">{targetBook.ownerName}</span>
              </p>
            </div>
          </div>

          <button
            id="close-swap-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Catalog Selection Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
          {/* SECTION 1: TARGET USER LISTINGS PICKER */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Foydalanuvchining barcha kitoblari (Qaysi biriga almashasiz?)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-semibold border border-amber-200/60 dark:border-amber-800/60">
                {targetOwnerBooks.length} ta kitob
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
              {targetOwnerBooks.map((book) => {
                const isSelected = selectedTargetBook?.id === book.id;
                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedTargetBook(book)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative text-left group ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 shadow-xs ring-1 ring-amber-500'
                        : 'bg-white dark:bg-zinc-800/90 border-stone-200/90 dark:border-zinc-700/80 hover:border-amber-300 dark:hover:border-amber-600'
                    }`}
                  >
                    {/* Selected check badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs z-10">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700 shrink-0 border border-stone-200 dark:border-zinc-600 shadow-2xs flex items-center justify-center">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-12 h-16 object-cover"
                          />
                        ) : (
                          <BookOpen className="w-5 h-5 text-stone-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                          {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-1.5 border-t border-stone-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px] text-stone-600 dark:text-zinc-400">
                      <span className="truncate max-w-[90px] font-medium text-amber-800 dark:text-amber-300">
                        {getSwapTermLabel(book)}
                      </span>
                      <span className="capitalize font-semibold text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-stone-300">
                        {book.condition || 'Yaxshi'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: INITIATOR BOOK SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                <BookOpen className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                <span>Sizning kitobingiz (Evaziga nimani taklif qilasiz?)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-semibold">
                {myAvailableBooks.length} ta faol
              </span>
            </div>

            {myAvailableBooks.length === 0 ? (
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                  <AlertCircle className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h4 className="font-serif font-bold text-sm text-amber-950 dark:text-amber-200">
                  Almashish uchun avval oʻz kitobingizni qoʻshishingiz kerak
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 max-w-sm mx-auto leading-relaxed">
                  Boshqa kitobxonlar bilan teng almashish uchun profilingizda kamida bitta faol kitob eʼloni boʻlishi lozim.
                </p>
                {onOpenAddModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddModal();
                    }}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141413] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Kitob qoʻshish</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                {myAvailableBooks.map((book) => {
                  const isSelected = selectedMyBookId === book.id;
                  return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedMyBookId(book.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative text-left group ${
                        isSelected
                          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 shadow-xs ring-1 ring-amber-500'
                          : 'bg-white dark:bg-zinc-800/90 border-stone-200/90 dark:border-zinc-700/80 hover:border-amber-300 dark:hover:border-amber-600'
                      }`}
                    >
                      {/* Selected check badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs z-10">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700 shrink-0 border border-stone-200 dark:border-zinc-600 shadow-2xs flex items-center justify-center">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-12 h-16 object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-stone-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            {book.title}
                          </h4>
                          <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                            {book.author}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-1.5 border-t border-stone-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px] text-stone-600 dark:text-zinc-400">
                        <span className="truncate max-w-[90px] font-medium text-stone-700 dark:text-stone-300">
                          {book.category}
                        </span>
                        <span className="capitalize font-semibold text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-stone-300">
                          {book.condition || 'Yaxshi'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: SMART OFFER SUMMARY CARD & SUBMIT */}
        <div className="p-4 sm:p-5 border-t border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md shrink-0 space-y-3">
          {selectedMyBook && selectedTargetBook && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-xs relative">
              <div className="text-[10px] font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-2 text-center">
                Taklif xulosasi
              </div>

              <div className="grid grid-cols-2 gap-3 items-center relative">
                {/* Center Badge Separator */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-50 dark:bg-zinc-850 border border-amber-300 dark:border-amber-600 shadow-md flex items-center justify-center z-10 pointer-events-none"
                >
                  <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>

                {/* Left: Mening kitobim */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-zinc-850/80 border border-stone-200/70 dark:border-zinc-700/70 min-w-0">
                  <div className="w-9 h-12 rounded overflow-hidden bg-stone-200 dark:bg-zinc-700 shrink-0 border border-stone-200 dark:border-zinc-600">
                    {selectedMyBook.coverUrl ? (
                      <img
                        src={selectedMyBook.coverUrl}
                        alt={selectedMyBook.title}
                        className="w-9 h-12 object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-semibold text-stone-500 dark:text-zinc-400 uppercase block">
                      Mening kitobim
                    </span>
                    <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {selectedMyBook.title}
                    </h5>
                    <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate">
                      {selectedMyBook.author}
                    </p>
                  </div>
                </div>

                {/* Right: Tanlangan kitob */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-zinc-850/80 border border-stone-200/70 dark:border-zinc-700/70 min-w-0">
                  <div className="w-9 h-12 rounded overflow-hidden bg-stone-200 dark:bg-zinc-700 shrink-0 border border-stone-200 dark:border-zinc-600">
                    {selectedTargetBook.coverUrl ? (
                      <img
                        src={selectedTargetBook.coverUrl}
                        alt={selectedTargetBook.title}
                        className="w-9 h-12 object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 uppercase block">
                      Tanlangan kitob
                    </span>
                    <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {selectedTargetBook.title}
                    </h5>
                    <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate">
                      {selectedTargetBook.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            id="submit-swap-request-btn"
            type="button"
            disabled={isSubmitting || !selectedTargetBook || !selectedMyBook}
            onClick={handleSubmit}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs sm:text-sm font-semibold shadow-tactile transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Taklif yuborilmoqda...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                <span>Taklif yuborish</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
