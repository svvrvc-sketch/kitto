'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  BookOpen,
  Check,
  CheckCheck,
  Search,
  X,
  MapPin,
  QrCode,
  Compass,
  UserPlus,
  Trash2,
  Sun,
  Moon,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sidebar } from '@/components/Sidebar';
import { Logo } from '@/components/Logo';
import { ExchangeProposalCard } from '@/components/chat/ExchangeProposalCard';
import { SwapQRModal } from '@/components/SwapQRModal';
import { booksService, chatsService } from '@/services/db';
import { Book } from '@/types/book';
import { ChatMessage, ChatThread } from '@/types/chat';
import { useToast } from '@/context/ToastContext';

const TASHKENT_METRO_STATIONS = [
  'Chilonzor',
  'Paxtakor',
  'Amir Temur xiyoboni',
  'Oybek',
  'Buyuk Ipak Yo‘li',
  'Novza',
  'Beruniy',
  'Kosmonavtlar',
  'G‘afur G‘ulom',
  'Ming O‘rik',
  'Toshkent vokzal',
  'Shahriston',
];

// Pure web audio chime for realistic incoming message
function playIncomingPing() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Ignore audio autoplays restrictions
  }
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get('thread');
  const bookIdParam = searchParams.get('bookId');

  const { user, isAuthenticated, loginWithGoogle, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    getMessages,
    sendMessage,
    startConversation,
    updateProposalStatus,
    markAsRead,
    clearAllChats,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [searchThreadsQuery, setSearchThreadsQuery] = useState('');
  const [showMetroPicker, setShowMetroPicker] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Global theme
  const { isDark, toggleTheme } = useTheme();

  // Realistic Telegram simulation states
  const [isTyping, setIsTyping] = useState(false);

  // QR Modal
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrSelectedBook, setQrSelectedBook] = useState<Book | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.id || '';

  // Load books
  useEffect(() => {
    booksService.getBooks().then((b) => setAllBooks(b)).catch(() => {});
  }, []);

  // Handle bookId query parameter from book card click
  useEffect(() => {
    if (bookIdParam && allBooks.length > 0) {
      const targetBook = allBooks.find((b) => b.id === bookIdParam);
      if (targetBook) {
        const tId = startConversation(targetBook);
        setActiveThreadId(tId);
      }
    }
  }, [bookIdParam, allBooks, startConversation, setActiveThreadId]);

  // Sync thread from query param
  useEffect(() => {
    if (threadParam && threads.some((t) => t.id === threadParam)) {
      setActiveThreadId(threadParam);
      markAsRead(threadParam);
    }
  }, [threadParam, threads, setActiveThreadId, markAsRead]);

  // Filter threads for current user
  const userThreads = useMemo(() => {
    if (!currentUserId) return [];
    let list = threads.filter(
      (t) => t.ownerId === currentUserId || t.initiatorId === currentUserId
    );

    if (searchThreadsQuery.trim()) {
      const q = searchThreadsQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const otherParty =
          t.initiatorId === currentUserId ? t.ownerName : t.initiatorName;
        return (
          (t.bookTitle && t.bookTitle.toLowerCase().includes(q)) ||
          (otherParty && otherParty.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [threads, currentUserId, searchThreadsQuery]);

  const activeThread = useMemo(() => {
    return userThreads.find((t) => t.id === activeThreadId) || null;
  }, [userThreads, activeThreadId]);

  const messages = useMemo(() => {
    if (!activeThreadId) return [];
    return getMessages(activeThreadId);
  }, [activeThreadId, getMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const prevMessagesLengthRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const last = messages[messages.length - 1];
      if (last && last.senderId !== currentUserId) {
        playIncomingPing();
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, currentUserId]);

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() || !activeThreadId || !activeThread) return;

    sendMessage(activeThreadId, textToSend.trim());
    if (customText === undefined) {
      setInputText('');
    }
  };

  const handleSendMetroSuggestion = (station: string) => {
    const text = `📍 Uchrashuv joyi taklifi: ${station} metro bekati vestibyuli`;
    handleSendMessage(undefined, text);
    setShowMetroPicker(false);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!activeThreadId) return;
    await updateProposalStatus(activeThreadId, proposalId, 'accepted');
  };

  const handleDeclineProposal = async (proposalId: string) => {
    if (!activeThreadId) return;
    await updateProposalStatus(activeThreadId, proposalId, 'declined');
  };

  const handleOpenQR = (bookId: string) => {
    const target = allBooks.find((b) => b.id === bookId);
    if (target) {
      setQrSelectedBook(target);
      setIsQRModalOpen(true);
    }
  };

  const handleStartNewChatWithBook = (book: Book) => {
    const threadId = startConversation(book);
    setActiveThreadId(threadId);
    setIsNewChatModalOpen(false);
  };

  const handleClearAllChatsConfirm = () => {
    if (window.confirm('Barcha yozishmalar tarixini tozalashni tasdiqlaysizmi? Yangi toza suhbatlar boshlash mumkin bo\'ladi.')) {
      clearAllChats();
      showToast('Suhbatlar tarixi tozalandi', 'info');
    }
  };

  // If not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-stone-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <MessageSquare className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h1 className="font-sans text-2xl font-extrabold text-stone-900 dark:text-stone-100 mb-2">
            Telegram uslubidagi Suhbatlar
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            Kitobxonlar bilan xabarlashish, metroda uchrashuv belgilash va almashuv takliflarini yuborish uchun tizimga kiring.
          </p>

          <button
            onClick={() => loginWithGoogle().catch(() => openAuthModal())}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google orqali kirish</span>
          </button>

          <div className="mt-5">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kitoblar katalogiga o&#39;tish</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter books for the "New Chat" search modal
  const searchableBooks = allBooks.filter((b) => {
    if (b.ownerId === currentUserId) return false;
    if (!newChatSearch.trim()) return true;
    const q = newChatSearch.toLowerCase().trim();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.ownerName && b.ownerName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-screen flex flex-col bg-[#FAF9F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors overflow-hidden">
      {/* 1. Dedicated Full-Width Header (Clean & Uncrowded on Mobile & Desktop) */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile Back Button to Catalog */}
          <Link
            href="/catalog"
            className="p-1.5 -ml-1 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex sm:hidden items-center justify-center shrink-0"
            title="Katalogga qaytish"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700 dark:text-stone-200" />
          </Link>

          <Link href="/catalog" className="flex items-center gap-2 group focus:outline-none shrink-0" title="Kitto">
            <Logo showTagline={false} size={26} />
          </Link>

          <span className="hidden sm:inline text-stone-300 dark:text-stone-700">|</span>

          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </Link>
        </div>

        {/* Center: Title with live pulse */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-sans text-xs sm:text-base font-bold text-stone-900 dark:text-stone-100">
            Xabarlar
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* New Chat Button */}
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            title="Yangi kitobxon bilan suhbat ochish"
          >
            <UserPlus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">+ Yangi suhbat</span>
          </button>

          {/* Sidebar Drawer Toggle */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setShowSidebarDrawer(true);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            title="Kabinet menyusini ochish"
          >
            <Menu className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Kabinetim</span>
          </button>

          {/* Clear Chats Button (Desktop only on top bar; mobile has it inside chat list header) */}
          {userThreads.length > 0 && (
            <button
              onClick={handleClearAllChatsConfirm}
              className="hidden sm:flex p-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-500 hover:text-red-600 transition-colors shadow-2xs"
              title="Suhbatlar tarixini tozalash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle (Desktop only on top bar; mobile in drawer) */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition-colors shadow-2xs"
            title="Mavzuni almashtirish"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main Two-Column Layout (Zero Squishing, Wide & Dignified) */}
      <div className="flex-1 min-w-0 flex overflow-hidden">
        {/* Collapsible Sidebar for Desktop (>= 1024px) */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar
            standalone
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Left Pane: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-200/80 dark:border-stone-800 flex flex-col bg-white dark:bg-stone-900 shrink-0 ${
            activeThreadId ? 'max-md:hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header + Search */}
          <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100">
                  Suhbatlar ro&#39;yxati
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Kitobxonlar bilan yozishmalar
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {userThreads.length} ta
                </span>
                {userThreads.length > 0 && (
                  <button
                    onClick={handleClearAllChatsConfirm}
                    className="p-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-400 hover:text-red-500 transition-colors"
                    title="Barcha suhbatlarni tozalash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchThreadsQuery}
                onChange={(e) => setSearchThreadsQuery(e.target.value)}
                placeholder="Ism yoki kitob nomi..."
                className="w-full pl-8 pr-7 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {searchThreadsQuery && (
                <button
                  onClick={() => setSearchThreadsQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Thread Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
            {userThreads.length > 0 ? (
              userThreads.map((thread) => {
                const isSelected = thread.id === activeThreadId;
                const otherPartyName =
                  thread.initiatorId === currentUserId ? thread.ownerName : thread.initiatorName;
                const isUnread = (thread.unreadCount || 0) > 0;
                const lastMsg =
                  thread.messages && thread.messages.length > 0
                    ? thread.messages[thread.messages.length - 1]
                    : null;

                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      markAsRead(thread.id);
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-stone-800/90 border-l-4 border-amber-600'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {(otherPartyName || 'K').charAt(0).toUpperCase()}
                      </div>
                      {isUnread && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-stone-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className="font-sans text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
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

                      {/* Book name badge */}
                      <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 truncate flex items-center gap-1 mb-0.5">
                        <BookOpen className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{thread.bookTitle}</span>
                      </div>

                      {/* Last message text */}
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {lastMsg?.text || thread.lastMessage || 'Yangi suhbat'}
                        </p>
                        {isUnread && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white shrink-0">
                            Yangi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-stone-400">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Hozircha suhbatlar yo&#39;q
                </p>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Yangi kitobxonga yozish uchun &ldquo;+ Yangi suhbat&rdquo; tugmasini bosing yoki Katalogdan kitob tanlang.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                  >
                    + Yangi suhbat boshlash
                  </button>
                  <Link
                    href="/catalog"
                    className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 transition-all text-center"
                  >
                    Katalogdagi kitoblarni ko&#39;rish
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Telegram Interactive Chat Window */}
        <div
          className={`flex-1 min-w-0 flex flex-col bg-[#EFECE6] dark:bg-stone-950 relative overflow-hidden ${
            !activeThreadId ? 'max-md:hidden md:flex' : 'flex'
          }`}
        >
          {activeThread ? (
            <>
              {/* Telegram Top Bar */}
              <div className="px-4 py-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0 shadow-2xs z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back to list on mobile */}
                  <button
                    onClick={() => setActiveThreadId(null)}
                    className="md:hidden p-1.5 -ml-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-bold"
                    title="Orqaga"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Partner Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {((activeThread.initiatorId === currentUserId
                        ? activeThread.ownerName
                        : activeThread.initiatorName) || 'K').charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
                  </div>

                  {/* Name + Live Status */}
                  <div className="min-w-0">
                    <h2 className="font-sans text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                      {activeThread.initiatorId === currentUserId
                        ? activeThread.ownerName
                        : activeThread.initiatorName}
                    </h2>

                    {/* Live typing or online indicator */}
                    {isTyping ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                        <span>yozmoqda</span>
                        <span className="inline-flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-amber-600 animate-bounce" />
                          <span className="w-1 h-1 rounded-full bg-amber-600 animate-bounce delay-100" />
                          <span className="w-1 h-1 rounded-full bg-amber-600 animate-bounce delay-200" />
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
                        <span>oxirgi marta bugun</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Book details */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQR(activeThread.bookId)}
                    className="hidden sm:flex items-center gap-1 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-600" />
                    <span>QR-kod</span>
                  </button>

                  <Link
                    href={`/book/${activeThread.bookId}`}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-[11px] font-semibold text-stone-700 dark:text-stone-200 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Kitob: {activeThread.bookTitle}</span>
                    <span className="sm:hidden">Kitob</span>
                  </Link>
                </div>
              </div>

              {/* Messages Body (Telegram aesthetic) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#EFECE6] dark:bg-stone-950">
                {/* Day Divider */}
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/70 dark:bg-stone-800/70 text-stone-600 dark:text-stone-400 shadow-2xs backdrop-blur-xs">
                    Bugun
                  </span>
                </div>

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
                          onOpenQRModal={() => handleOpenQR(activeThread.bookId)}
                          onOpenBookDetail={(bId) => router.push(`/book/${bId}`)}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                          isMe
                            ? 'bg-amber-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200/90 dark:border-stone-800 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMe ? 'text-amber-100/90' : 'text-stone-400'
                          }`}
                        >
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString('uz-UZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                          {isMe &&
                            (msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-200 stroke-[2.5]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-amber-200 stroke-[2.5]" />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing animation bubble */}
                {isTyping && (
                  <div className="flex justify-start animate-in fade-in duration-150">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce delay-200" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Metro Meeting Point Picker Dropdown */}
              {showMetroPicker && (
                <div className="p-3 bg-amber-50 dark:bg-stone-900 border-t border-amber-200 dark:border-stone-800 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Toshkent metrosida uchrashuv joyini tanlang:</span>
                    </span>
                    <button
                      onClick={() => setShowMetroPicker(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {TASHKENT_METRO_STATIONS.map((station) => (
                      <button
                        key={station}
                        type="button"
                        onClick={() => handleSendMetroSuggestion(station)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-amber-200/80 dark:border-stone-700 hover:border-amber-500 text-[11px] font-semibold transition-all active:scale-95"
                      >
                        {station} bekati
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setShowMetroPicker(!showMetroPicker)}
                  className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                    showMetroPicker
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-amber-500'
                  }`}
                  title="Uchrashuv joyi taklif qilish (Metro)"
                >
                  <MapPin className="w-4 h-4 text-amber-600" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Xabar yozing..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white transition-all disabled:opacity-40 shadow-xs shrink-0"
                  title="Yuborish"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <div className="w-16 h-16 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center mb-4 shadow-sm text-amber-600">
                <MessageSquare className="w-8 h-8 stroke-[1.6]" />
              </div>
              <h3 className="font-sans text-lg font-bold text-stone-800 dark:text-stone-200">
                Suhbatni tanlang yoki yangisini oching
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mt-1 mb-5 leading-relaxed">
                Chap tarafdagi ro&#39;yxatdan kitobxonni tanlang yoki yuqoridagi &ldquo;+ Yangi suhbat&rdquo; tugmasi orqali istalgan kitobxonni topib yozing.
              </p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Yangi suhbat boshlash</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Search Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  Yangi suhbat boshlash
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Toshkentdagi faol kitobxonlar va ularning kitoblari
                </p>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3.5 border-b border-stone-100 dark:border-stone-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Kitobxon ismi yoki kitob nomini qidiring..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  autoFocus
                />
              </div>
            </div>

            {/* Books & Readers list */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-800">
              {searchableBooks.length > 0 ? (
                searchableBooks.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleStartNewChatWithBook(b)}
                    className="p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-13 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                        {b.coverUrl ? (
                          <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 transition-colors">
                          {b.ownerName || 'Kitobxon'}
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold truncate mt-0.5">
                          {b.title} ({b.author})
                        </p>
                        <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{b.location?.addressText || b.exactLocation || 'Toshkent'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-amber-600 group-hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs shrink-0"
                    >
                      Yozish
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Kitobxon topilmadi. Qidiruv so&#39;zini o&#39;zgartirib ko&#39;ring.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Off-Canvas Cabinet Sidebar Drawer */}
      {showSidebarDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setShowSidebarDrawer(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#FAF9F5] dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <Sidebar standalone onCloseMobile={() => setShowSidebarDrawer(false)} />
          </div>
        </div>
      )}

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
        <div className="min-h-screen bg-[#FAF9F5] dark:bg-stone-950 flex items-center justify-center">
          <div className="animate-pulse font-sans text-sm text-stone-600 font-bold">
            Xabarlar yuklanmoqda...
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
