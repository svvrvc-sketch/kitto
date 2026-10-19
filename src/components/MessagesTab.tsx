'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  BookOpen,
  CheckCheck,
  ArrowLeftRight,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { ExchangeProposalCard } from '@/components/chat/ExchangeProposalCard';
import { Book } from '@/types/book';

interface MessagesTabProps {
  onOpenBookDetail?: (bookId: string) => void;
  onGoToFeed?: () => void;
  onOpenUserProfile?: (userId: string) => void;
  onOpenQRModal?: (targetBook: Book, mode?: 'handover' | 'return') => void;
  onOpenAddModal?: () => void;
  books?: Book[];
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  onOpenBookDetail,
  onGoToFeed,
  onOpenUserProfile,
  onOpenQRModal,
  onOpenAddModal,
  books = [],
}) => {
  const { user, openAuthModal } = useAuth();
  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    getMessages,
    sendMessage,
    sendExchangeProposal,
    updateProposalStatus,
    markAsRead,
    isLoading,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedMyBookId, setSelectedMyBookId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id || 'guest_user';

  // Filter threads where user is either initiator or owner
  const userThreads = threads.filter(
    (t) => t.initiatorId === currentUserId || t.ownerId === currentUserId
  );

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThreadId ? getMessages(activeThreadId) : [];

  // Current user's available books that can be offered in an exchange
  const myAvailableBooks = useMemo(() => {
    if (!user) return [];
    return books.filter(
      (b) => b.ownerId === user.id && (b.status === 'active' || !b.status)
    );
  }, [books, user]);

  useEffect(() => {
    if (activeThreadId) {
      markAsRead(activeThreadId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThreadId, messages.length, markAsRead]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    sendMessage(activeThreadId, inputText.trim());
    setInputText('');
  };

  const handleStarterClick = (starterText: string) => {
    if (!activeThreadId) return;
    sendMessage(activeThreadId, starterText);
  };

  const handleSendProposal = () => {
    if (!activeThread || !selectedMyBookId || !user) return;
    const offeredBook = myAvailableBooks.find((b) => b.id === selectedMyBookId);
    if (!offeredBook) return;

    const requestedBookMeta = {
      id: activeThread.bookId,
      title: activeThread.bookTitle,
      author: activeThread.bookAuthor || 'Muallif',
      cover_url: activeThread.bookCover,
      coverUrl: activeThread.bookCover,
    };

    const offeredBookMeta = {
      id: offeredBook.id,
      title: offeredBook.title,
      author: offeredBook.author,
      cover_url: offeredBook.coverUrl,
      coverUrl: offeredBook.coverUrl,
    };

    const targetOwnerId =
      activeThread.ownerId === currentUserId
        ? activeThread.initiatorId
        : activeThread.ownerId;

    sendExchangeProposal(
      activeThread.id,
      offeredBookMeta,
      requestedBookMeta,
      targetOwnerId
    );

    setIsProposalModalOpen(false);
    setSelectedMyBookId(null);
  };

  const handleOpenQRForProposal = (msgBookId?: string) => {
    if (!activeThread) return;
    const targetBookId = msgBookId || activeThread.bookId;
    const bookObj =
      books.find((b) => b.id === targetBookId) ||
      ({
        id: targetBookId,
        title: activeThread.bookTitle,
        author: activeThread.bookAuthor || 'Muallif',
        category: 'Badiiy',
        condition: 'yaxshi',
        coverUrl: activeThread.bookCover,
        ownerId: activeThread.ownerId,
        ownerName: activeThread.ownerName,
        ownerContact: '+998 90 000 00 00',
        city: 'Toshkent',
        location: {
          lat: 41.311081,
          lng: 69.240562,
          addressText: activeThread.exactLocation || 'Toshkent',
        },
        swapTerm: {
          type: 'permanent',
          durationLabel: activeThread.bookSwapLabel,
        },
        status: 'borrowed',
        createdAt: new Date().toISOString(),
      } as Book);

    if (onOpenQRModal) {
      onOpenQRModal(bookObj, 'handover');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // If user is guest and has no threads
  if (!user && userThreads.length === 0) {
    return (
      <div className="py-12 sm:py-16 text-center max-w-md mx-auto px-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-200 dark:border-zinc-700">
          <MessageSquare className="w-8 h-8 stroke-[1.6]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Xabarlar
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Kitob egalari bilan uchrashuv nuqtasi va mutolaa muddatini bevosita ilova ichida kelishish uchun tizimga kiring.
        </p>
        <div className="mt-6">
          <button
            id="chat-login-prompt-btn"
            onClick={() =>
              openAuthModal('Xabarlarni koʻrish va suhbatlashish uchun tizimga kiring')
            }
            className="w-full py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-semibold shadow-tactile transition-all active:scale-[0.99]"
          >
            Tizimga kirish
          </button>
        </div>
      </div>
    );
  }

  // Active Thread Chat Content View
  const renderChatRoom = () => {
    if (!activeThread) {
      return (
        <div className="hidden md:flex flex-col items-center justify-center h-full p-8 text-center text-stone-400 dark:text-zinc-400">
          <MessageSquare className="w-12 h-12 stroke-[1.2] opacity-40 mb-3" />
          <p className="text-sm font-medium">
            Suhbatni ko&#39;rish uchun chap tarafdagi ro&#39;yxatdan tanlang
          </p>
        </div>
      );
    }

    const otherPersonName =
      activeThread.ownerId === currentUserId
        ? activeThread.initiatorName
        : activeThread.ownerName;
    const otherPersonId =
      activeThread.ownerId === currentUserId
        ? activeThread.initiatorId
        : activeThread.ownerId;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900 relative">
        {/* Top Header */}
        <div className="p-3.5 border-b border-stone-200/80 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              id="chat-back-btn"
              type="button"
              onClick={() => setActiveThreadId(null)}
              className="md:hidden p-1.5 -ml-1 rounded-full hover:bg-stone-200/60 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors"
              title="Ro'yxatga qaytish"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div
              id="chat-counterpart-profile-trigger"
              onClick={() => onOpenUserProfile && onOpenUserProfile(otherPersonId)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition-opacity"
              title="Foydalanuvchi profilini ko'rish"
            >
              <div className="w-9 h-9 rounded-full bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {(otherPersonName || 'K').charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:underline underline-offset-2">
                  {otherPersonName || 'Kitobxon'}
                </h3>
                <div className="text-[10px] text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span>Profilni ko&#39;rish</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA to propose an exchange */}
          <button
            type="button"
            onClick={() => setIsProposalModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
            title="Kitob almashish taklifini yuborish"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Almashish taklifi</span>
          </button>
        </div>

        {/* Pinned Contextual Book Banner */}
        <div className="px-3.5 py-2.5 bg-stone-100/70 dark:bg-zinc-800/80 border-b border-stone-200/70 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {activeThread.bookCover && (
              <img
                src={activeThread.bookCover}
                alt={activeThread.bookTitle}
                className="w-8 h-11 object-cover rounded shadow-xs shrink-0 border border-stone-200 dark:border-zinc-700"
              />
            )}
            <div className="min-w-0">
              <div className="font-serif font-bold text-stone-900 dark:text-stone-100 text-xs truncate">
                {activeThread.bookTitle}
              </div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate mt-0.5">
                {activeThread.bookSwapLabel}
              </div>
            </div>
          </div>

          {onOpenBookDetail && (
            <button
              type="button"
              onClick={() => onOpenBookDetail(activeThread.bookId)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[11px] font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-all shadow-2xs"
            >
              <BookOpen className="w-3 h-3 text-stone-500 dark:text-zinc-400" />
              <span>Kitobni ko&#39;rish</span>
            </button>
          )}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="text-center py-6 px-4">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-300 border border-stone-200/70 dark:border-zinc-700">
                Suhbat boshlandi. Birinchi xabaringizni yoki almashish taklifini yuboring.
              </span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;

              // RENDER RICH INTERACTIVE EXCHANGE PROPOSAL CARD
              if (msg.type === 'exchange_proposal' && msg.proposal) {
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMine ? 'items-end' : 'items-start'
                    } my-1 w-full animate-in fade-in duration-200`}
                  >
                    <ExchangeProposalCard
                      proposal={msg.proposal}
                      messageId={msg.id}
                      senderId={msg.senderId}
                      currentUserId={currentUserId}
                      targetOwnerId={
                        msg.proposal.target_owner_id ||
                        (activeThread.ownerId === currentUserId
                          ? activeThread.initiatorId
                          : activeThread.ownerId)
                      }
                      onAccept={async (propId) => {
                        await updateProposalStatus(activeThread.id, propId, 'accepted');
                      }}
                      onDecline={async (propId) => {
                        await updateProposalStatus(activeThread.id, propId, 'declined');
                      }}
                      onOpenQRModal={() =>
                        handleOpenQRForProposal(msg.proposal?.requested_book?.id)
                      }
                      onOpenBookDetail={onOpenBookDetail}
                    />
                    <div
                      className={`mt-1 flex items-center gap-1 text-[9px] px-1 ${
                        isMine ? 'text-stone-400 dark:text-zinc-400' : 'text-stone-400 dark:text-zinc-400'
                      }`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMine && <CheckCheck className="w-3 h-3 stroke-[2]" />}
                    </div>
                  </div>
                );
              }

              // REGULAR TEXT MESSAGE
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMine ? 'items-end' : 'items-start'
                  } animate-in fade-in duration-150`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-[#141413] text-[#F8F7F4] dark:bg-zinc-800 dark:text-stone-100 rounded-tr-xs'
                        : 'bg-stone-100 dark:bg-zinc-850 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-zinc-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                        isMine ? 'text-stone-300 dark:text-zinc-400' : 'text-stone-400 dark:text-zinc-400'
                      }`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMine && <CheckCheck className="w-3 h-3 stroke-[2]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick-Starter Chips (When thread has 0 messages) */}
        {messages.length === 0 && (
          <div className="p-2 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/60 flex flex-wrap gap-1.5 text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setIsProposalModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25 text-[10px] font-semibold transition-all active:scale-95 flex items-center gap-1"
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Almashish taklifini yuborish</span>
            </button>
            {[
              "Salom! Shu kitob hali ham bormi?",
              "Salom! Xaritada belgilangan joyda qachon ko'rishsak bo'ladi?",
              "Kitobni ko'rsatilgan muddatga o'qishga olsam bo'ladimi?",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleStarterClick(chip)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-zinc-500 text-[10px] font-medium transition-all active:scale-95 text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar with Propose Exchange Button */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white dark:bg-zinc-900 border-t border-stone-200/80 dark:border-zinc-800 flex items-center gap-2 shrink-0"
        >
          <button
            id="chat-open-exchange-proposal-btn"
            type="button"
            onClick={() => setIsProposalModalOpen(true)}
            className="p-2.5 rounded-2xl bg-stone-100 hover:bg-amber-100/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 text-amber-700 dark:text-amber-400 transition-all active:scale-95 shrink-0"
            title="Kitob almashish taklifini yuborish"
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[2]" />
          </button>

          <input
            id="chat-message-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Xabaringizni yozing..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100/70 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95 shrink-0"
            title="Yuborish"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>

        {/* MODAL / SHEET: PROPOSE BOOK EXCHANGE */}
        {isProposalModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsProposalModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      Almashish taklifi yuborish
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                      O&#39;z kitobingizni tanlang
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Book Info */}
              <div className="mt-3 p-3 rounded-2xl bg-[#F8F7F4] dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700/80 flex items-center gap-3">
                {activeThread.bookCover && (
                  <img
                    src={activeThread.bookCover}
                    alt={activeThread.bookTitle}
                    className="w-10 h-14 object-cover rounded-md shadow-2xs border border-stone-200 dark:border-zinc-700 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    So&#39;ralayotgan kitob
                  </span>
                  <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                    {activeThread.bookTitle}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                    Egasi: {activeThread.ownerName}
                  </p>
                </div>
              </div>

              {/* User Listings Selection */}
              <div className="flex-1 overflow-y-auto my-3.5 space-y-2 pr-1">
                <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Evaziga taklif qilmoqchi bo&#39;lgan kitobingiz:</span>
                </div>

                {myAvailableBooks.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-stone-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-700">
                    <p className="text-xs text-stone-600 dark:text-zinc-300 mb-3">
                      Sizda hali faol kitob eʼlonlari yoʻq. Almashish taklifini yuborish uchun avval oʻz kitobingizni joylang.
                    </p>
                    {onOpenAddModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProposalModalOpen(false);
                          onOpenAddModal();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141413] hover:bg-black text-white text-xs font-medium shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kitob qoʻshish</span>
                      </button>
                    )}
                  </div>
                ) : (
                  myAvailableBooks.map((book) => {
                    const isSelected = selectedMyBookId === book.id;
                    return (
                      <div
                        key={book.id}
                        onClick={() => setSelectedMyBookId(book.id)}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                            : 'bg-white dark:bg-zinc-800/80 border-stone-200 dark:border-zinc-700 hover:border-amber-400'
                        }`}
                      >
                        <div className="w-10 h-14 rounded-md overflow-hidden bg-stone-100 dark:bg-zinc-700 shrink-0 border border-stone-200 dark:border-zinc-700 flex items-center justify-center">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-10 h-14 object-cover"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 text-stone-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                            {book.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                            {book.author}
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-stone-300 font-medium">
                            {book.category}
                          </span>
                        </div>

                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-amber-600">
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200/80 dark:border-zinc-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={!selectedMyBookId}
                  onClick={handleSendProposal}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Taklifni yuborish</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] sm:h-[680px] rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-editorial overflow-hidden bg-white dark:bg-zinc-900 flex flex-col md:flex-row">
      {/* Left List Pane (Visible on desktop or when no thread selected on mobile) */}
      <div
        className={`w-full md:w-80 md:border-r border-stone-200/80 dark:border-zinc-800 flex flex-col ${
          activeThreadId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-stone-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Xabarlar
            </h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 font-semibold text-stone-600 dark:text-stone-300">
            {userThreads.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-zinc-800">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 bg-stone-200 dark:bg-zinc-800 rounded" />
                    <div className="h-2.5 w-40 bg-stone-100 dark:bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : userThreads.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <MessageSquare className="w-8 h-8 opacity-40 mx-auto mb-2 text-stone-400 dark:text-zinc-500" />
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Hozircha xabarlar mavjud emas
              </p>
              {onGoToFeed && (
                <button
                  type="button"
                  onClick={onGoToFeed}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-semibold shadow-xs"
                >
                  Kitoblarni ko&#39;rish
                </button>
              )}
            </div>
          ) : (
            userThreads.map((thread) => {
              const otherPerson =
                (thread.ownerId === currentUserId ? thread.initiatorName : thread.ownerName) || 'Kitobxon';
              const isSelected = thread.id === activeThreadId;
              const threadMsgs = Array.isArray(thread.messages) ? thread.messages : [];
              const lastMsg = threadMsgs.length > 0 ? threadMsgs[threadMsgs.length - 1] : undefined;
              const unread = threadMsgs.filter(
                (m) => m && !m.isRead && m.senderId !== currentUserId
              ).length;

              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    markAsRead(thread.id);
                  }}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-stone-100/80 dark:bg-zinc-800'
                      : 'hover:bg-stone-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {(otherPerson || 'K').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {otherPerson}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-stone-400 dark:text-zinc-400 shrink-0">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate">
                      📚 {thread.bookTitle}
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.text : 'Yangi suhbat boshlandi'}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Room Pane (Visible on desktop or when thread is active on mobile) */}
      <div
        className={`flex-1 flex flex-col ${
          activeThreadId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {renderChatRoom()}
      </div>
    </div>
  );
};
