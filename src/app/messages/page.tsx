'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  BookOpen,
  CheckCheck,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { ExchangeProposalCard } from '@/components/chat/ExchangeProposalCard';
import { SwapQRModal } from '@/components/SwapQRModal';
import { booksService } from '@/services/db';
import { Book } from '@/types/book';
import { LogoIcon } from '@/components/Logo';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get('thread');

  const { user, isAuthenticated, loginWithGoogle, openAuthModal } = useAuth();
  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    getMessages,
    sendMessage,
    updateProposalStatus,
    markAsRead,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // QR Modal
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrSelectedBook, setQrSelectedBook] = useState<Book | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.id || '';

  // Load books
  useEffect(() => {
    booksService.getBooks().then((b) => setAllBooks(b)).catch(() => {});
  }, []);

  // Filter threads belonging to current user
  const userThreads = useMemo(() => {
    if (!currentUserId) return [];
    return threads.filter(
      (t) => t.initiatorId === currentUserId || t.ownerId === currentUserId
    );
  }, [threads, currentUserId]);

  // Sync active thread from query param or default to first
  useEffect(() => {
    if (threadParam && threads.some((t) => t.id === threadParam)) {
      setActiveThreadId(threadParam);
      markAsRead(threadParam);
    } else if (!activeThreadId && userThreads.length > 0) {
      setActiveThreadId(userThreads[0].id);
      markAsRead(userThreads[0].id);
    }
  }, [threadParam, threads, activeThreadId, userThreads, setActiveThreadId, markAsRead]);

  const activeThread = userThreads.find((t) => t.id === activeThreadId) || null;
  const messages = activeThreadId ? getMessages(activeThreadId) : [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;
    sendMessage(activeThreadId, inputText.trim());
    setInputText('');
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!activeThreadId) return;
    await updateProposalStatus(activeThreadId, proposalId, 'accepted');
  };

  const handleDeclineProposal = async (proposalId: string) => {
    if (!activeThreadId) return;
    await updateProposalStatus(activeThreadId, proposalId, 'declined');
  };

  const handleOpenQR = () => {
    if (activeThread?.bookId) {
      const book = allBooks.find((b) => b.id === activeThread.bookId);
      if (book) {
        setQrSelectedBook(book);
        setIsQRModalOpen(true);
      }
    }
  };

  // If unauthenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mx-auto mb-4 border border-stone-200 dark:border-stone-700">
            <MessageSquare className="w-8 h-8 stroke-[1.6]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Xabarlar va takliflar
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            Boshqa kitobxonlar bilan xabarlashish va almashuv takliflarini qabul qilish uchun tizimga kiring.
          </p>

          <button
            onClick={() => loginWithGoogle().catch(() => openAuthModal())}
            className="w-full py-3.5 px-5 rounded-2xl bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google orqali kirish</span>
          </button>

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Asosiy do&#39;konga qaytish</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs">
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
            <Link
              href="/cabinet"
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold"
            >
              Kabinetim
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* Two-Pane Chat Shell */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: Conversations List */}
          <div
            className={`w-full lg:w-80 xl:w-96 border-r border-stone-200/80 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 shrink-0 ${
              activeThreadId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h1 className="font-serif text-lg font-bold">Suhbatlar</h1>
                <p className="text-[11px] text-stone-500">Kitobxonlar bilan yozishmalar</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {userThreads.length} ta
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-zinc-800/60">
              {userThreads.length > 0 ? (
                userThreads.map((thread) => {
                  const isSelected = thread.id === activeThreadId;
                  const otherPartyName =
                    thread.initiatorId === currentUserId ? thread.ownerName : thread.initiatorName;
                  const isUnread = (thread.unreadCount || 0) > 0;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setActiveThreadId(thread.id);
                        markAsRead(thread.id);
                      }}
                      className={`p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50/70 dark:bg-zinc-800/80 border-l-4 border-amber-600'
                          : 'hover:bg-stone-50 dark:hover:bg-zinc-850/50'
                      }`}
                    >
                      {/* Book Thumbnail */}
                      <div className="w-11 h-14 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-800 shrink-0 border border-stone-200 dark:border-zinc-700">
                        {thread.bookCover ? (
                          <img
                            src={thread.bookCover}
                            alt={thread.bookTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                            {otherPartyName || 'Kitobxon'}
                          </h3>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {thread.updatedAt
                              ? new Date(thread.updatedAt).toLocaleTimeString('uz-UZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 truncate">
                          {thread.bookTitle}
                        </div>

                        <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                          {thread.lastMessage || 'Yangi suhbat ochildi'}
                        </p>
                      </div>

                      {isUnread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-stone-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Hozircha suhbatlar mavjud emas.</p>
                  <p className="text-[11px] mt-1 text-stone-500">
                    Bosh sahifadagi kitoblardan birini tanlab, egasiga taklif yuboring.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Active Thread Chat */}
          <div
            className={`flex-1 flex flex-col bg-[#F8F7F4] dark:bg-zinc-950 ${
              !activeThreadId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {activeThread ? (
              <>
                {/* Chat Top Bar */}
                <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-b border-stone-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setActiveThreadId(null)}
                      className="lg:hidden p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-sm sm:text-base font-bold truncate">
                          {activeThread.initiatorId === currentUserId
                            ? activeThread.ownerName
                            : activeThread.initiatorName}
                        </h2>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Onlayn</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        Kitob: <span className="font-semibold text-stone-700 dark:text-stone-300">{activeThread.bookTitle}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/book/${activeThread.bookId}`}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 text-[11px] font-semibold text-stone-700 dark:text-stone-300"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Kitobni ko&#39;rish</span>
                  </Link>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;

                    if (msg.type === 'exchange_proposal' && msg.proposal) {
                      return (
                        <div key={msg.id} className="flex justify-center my-4">
                          <ExchangeProposalCard
                            proposal={msg.proposal}
                            messageId={msg.id}
                            senderId={msg.senderId}
                            senderName={msg.senderName}
                            currentUserId={currentUserId}
                            targetOwnerId={activeThread.ownerId}
                            onAccept={handleAcceptProposal}
                            onDecline={handleDeclineProposal}
                            onOpenQRModal={handleOpenQR}
                            onOpenBookDetail={(bId) => router.push(`/book/${bId}`)}
                          />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-[#141413] text-white dark:bg-stone-100 dark:text-stone-900 rounded-tr-xs'
                              : 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-zinc-800 rounded-tl-xs'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                              isMe ? 'text-stone-400 dark:text-stone-600' : 'text-stone-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString('uz-UZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-stone-200/80 dark:border-zinc-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Xabar yozing..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 transition-all active:scale-95 disabled:opacity-40"
                    title="Yuborish"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                <MessageSquare className="w-14 h-14 mb-3 opacity-30 stroke-[1.4]" />
                <h3 className="font-serif text-lg font-bold text-stone-700 dark:text-stone-300">
                  Suhbatni tanlang
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mt-1">
                  Chap tarafdagi roʻyxatdan suhbatni tanlang yoki kitob sahifasidan yangi taklif yuboring.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Handover Modal */}
      {isQRModalOpen && qrSelectedBook && (
        <SwapQRModal
          isOpen={isQRModalOpen}
          book={qrSelectedBook}
          mode="handover"
          onClose={() => setIsQRModalOpen(false)}
          onConfirmSuccess={() => {
            setIsQRModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 flex items-center justify-center">
          <div className="animate-pulse font-serif text-lg text-stone-600">Xabarlar yuklanmoqda...</div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
