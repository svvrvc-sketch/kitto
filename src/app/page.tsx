/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Book, AppTab, FeedFilterType, BookStatus } from '@/types/book';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { BookDetailModal } from '@/components/BookDetailModal';
import { AddBookModal } from '@/components/AddBookModal';
import { EmptyState } from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { CitySelectorModal } from '@/components/CitySelectorModal';
import { ProfileTab } from '@/components/ProfileTab';
import { MessagesTab } from '@/components/MessagesTab';
import { UserProfileModal } from '@/components/UserProfileModal';
import { GeolocationPrompt } from '@/components/GeolocationPrompt';
import { RegionRestrictionModal } from '@/components/RegionRestrictionModal';
import { SupportModal } from '@/components/SupportModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useChat } from '@/context/ChatContext';
import { calculateDistanceKm, isLocationOutsideTashkent } from '@/lib/geo-utils';
import { initTelegramApp } from '@/lib/telegram';
import { booksService, STORAGE_SAVED_KEY, STORAGE_BOOKS_KEY, mapRowToBook } from '@/services/db';
import { BookGridSkeleton } from '@/components/BookCardSkeleton';
import {
  Search,
  X,
  Clock,
  ArrowLeftRight,
  Gift,
  MapPinOff,
} from 'lucide-react';

const SESSION_GEO_COORDS_KEY = 'kitto_user_coords';
const STORAGE_GEO_DISMISSED_KEY = 'kitto_geo_prompt_dismissed';

const TASHKENT_CENTER = { lat: 41.311081, lng: 69.240562 };

export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const { startConversation, totalUnreadCount } = useChat();

  // Books and saved IDs state: Default [] on fresh start
  const [books, setBooks] = useState<Book[]>([]);
  const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  // User Geolocation Coordinates & First Launch Prompt State
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeoPromptOpen, setIsGeoPromptOpen] = useState(false);

  // Unified 5-Tab state: 'home' | 'saved' | 'messages' | 'my_listings' | 'profile'
  const [currentTab, setCurrentTab] = useState<AppTab>('home');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<FeedFilterType>('all');

  // Modals state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRegionBlockedModalOpen, setIsRegionBlockedModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Regional check: whether user is detected outside Tashkent
  const isOutsideTashkent = useMemo(() => {
    return isLocationOutsideTashkent(userCoordinates);
  }, [userCoordinates]);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Strict SSR mount guard and Cloud Database Hydration
  useEffect(() => {
    try {
      // 1. Saved Book IDs (key: kitto_saved_ids with bookswap_saved_ids fallback)
      const storedSaved =
        localStorage.getItem(STORAGE_SAVED_KEY) ||
        localStorage.getItem('bookswap_saved_ids');
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed)) {
          setSavedBookIds(new Set(parsed));
        }
      }

      // 2. Geolocation cache check (sessionStorage: kitto_user_coords with bookswap fallback)
      const sessionGeo =
        sessionStorage.getItem(SESSION_GEO_COORDS_KEY) ||
        sessionStorage.getItem('bookswap_user_coords');
      const storedDismissed =
        localStorage.getItem(STORAGE_GEO_DISMISSED_KEY) ||
        localStorage.getItem('bookswap_geo_prompt_dismissed');

      if (sessionGeo) {
        try {
          const parsedGeo = JSON.parse(sessionGeo);
          if (parsedGeo && typeof parsedGeo.lat === 'number') {
            setUserCoordinates(parsedGeo);
          }
        } catch {
          // ignore
        }
      } else if (!storedDismissed) {
        setIsGeoPromptOpen(true);
      }

      // 3. Asynchronously load books catalog via booksService (Supabase Cloud + offline fallback)
      setIsLoadingBooks(true);
      booksService
        .getBooks()
        .then((fetchedBooks) => {
          setBooks(fetchedBooks);
          setIsLoadingBooks(false);

          // Deep-link handler: open book detail modal if ?book={id} is present
          const urlParams = new URLSearchParams(window.location.search);
          const bookParam = urlParams.get('book');
          if (bookParam && fetchedBooks.length > 0) {
            const found = fetchedBooks.find((b) => b.id === bookParam);
            if (found) {
              setSelectedBook(found);
              setIsDetailModalOpen(true);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load books from service:', err);
          setIsLoadingBooks(false);
        });
    } catch (e) {
      console.error('Failed to load local storage:', e);
      setIsLoadingBooks(false);
    }
    setIsHydrated(true);
  }, []);

  // Real-time Cloud Synchronization for Books table
  useEffect(() => {
    const unsubscribe = booksService.subscribeToBooks((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const newBook = mapRowToBook(payload.new);
        setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedBook = mapRowToBook(payload.new);
        setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
        setSelectedBook((curr) => (curr && curr.id === updatedBook.id ? updatedBook : curr));
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setBooks((prev) => prev.filter((b) => b.id !== payload.old.id));
        setSelectedBook((curr) => (curr && curr.id === payload.old.id ? null : curr));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for coords updates from YandexMapPicker
  useEffect(() => {
    const handleCoordsUpdated = (e: any) => {
      if (e.detail && typeof e.detail.lat === 'number') {
        setUserCoordinates(e.detail);
      }
    };
    window.addEventListener('kitto_coords_updated', handleCoordsUpdated);
    window.addEventListener('bookswap_coords_updated', handleCoordsUpdated);
    return () => {
      window.removeEventListener('kitto_coords_updated', handleCoordsUpdated);
      window.removeEventListener('bookswap_coords_updated', handleCoordsUpdated);
    };
  }, []);

  // Automatically sync in-memory user books whenever user profile (genres, wishlist, contact) is updated
  useEffect(() => {
    if (user && isHydrated) {
      setBooks((prevBooks) => {
        let changed = false;
        const updated = prevBooks.map((b) => {
          if (b.ownerId === user.id) {
            const genresDiffer =
              JSON.stringify(b.ownerFavoriteGenres || []) !==
              JSON.stringify(user.favoriteGenres || []);
            const wishlistDiffers =
              JSON.stringify(b.ownerWishlist || []) !==
              JSON.stringify(user.wishlistBooks || []);
            const nameDiffers = b.ownerName !== user.name;
            const contactDiffers = b.ownerContact !== user.contact;

            if (genresDiffer || wishlistDiffers || nameDiffers || contactDiffers) {
              changed = true;
              return {
                ...b,
                ownerName: user.name,
                ownerContact: user.contact,
                ownerFavoriteGenres: user.favoriteGenres || [],
                ownerWishlist: user.wishlistBooks || [],
              };
            }
          }
          return b;
        });
        return changed ? updated : prevBooks;
      });
    }
  }, [user, isHydrated]);

  // Persist saved IDs
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(Array.from(savedBookIds)));
    } catch (e) {
      console.error('Failed to persist saved IDs:', e);
    }
  }, [savedBookIds, isHydrated]);

  // Persist books
  const persistBooks = (updatedList: Book[]) => {
    setBooks(updatedList);
    try {
      localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to persist books:', e);
    }
  };

  // Strictly guarded Telegram WebApp SDK initialization
  useEffect(() => {
    const isTg = initTelegramApp((isDark) => {
      setDarkMode(isDark);
    });

    if (!isTg && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle saved book with Guest protection
  const handleToggleSave = useCallback((bookId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!user) {
      openAuthModal("Kitoblarni saqlanganlarga qo'shish uchun tizimga kiring");
      return;
    }

    setSavedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
        showToast('Kitob saqlanganlardan chiqarildi', 'info');
      } else {
        next.add(bookId);
        showToast("Kitob saqlanganlarga qo'shildi", 'success');
      }
      return next;
    });
  }, [user, openAuthModal, showToast]);

  // Add new book
  const handleAddBook = (newBook: Book) => {
    const updated = [newBook, ...books.filter((b) => b.id !== newBook.id)];
    persistBooks(updated);
    booksService.addBook(newBook).catch((err) => {
      console.warn('Failed to sync book to Supabase:', err);
    });
    showToast(`"${newBook.title}" e'lon qilindi!`, 'success');
    setSelectedBook(newBook);
    setIsDetailModalOpen(true);
  };

  // Delete book permanently & cleanup matching saved IDs
  const handleDeleteBook = (bookId: string) => {
    const updated = books.filter((b) => b.id !== bookId);
    persistBooks(updated);
    booksService.deleteBook(bookId).catch((err) => {
      console.warn('Failed to delete book on Supabase:', err);
    });

    if (savedBookIds.has(bookId)) {
      setSavedBookIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }

    if (selectedBook?.id === bookId) {
      setIsDetailModalOpen(false);
      setSelectedBook(null);
    }

    showToast("E'lon muvaffaqiyatli o'chirildi", 'info');
  };

  // Toggle book status (supports active <-> temporarily_given for temporary books, and active <-> swapped for permanent/gift)
  const handleToggleStatus = (bookId: string) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    let newStatus: BookStatus = 'swapped';
    let newLoanInfo = undefined;

    const isTemporary = targetBook.swapTerm?.type === 'temporary';
    if (isTemporary) {
      if (targetBook.status === 'temporarily_given') {
        newStatus = 'active';
      } else {
        newStatus = 'temporarily_given';
        let durationDays = 14;
        if (targetBook.swapTerm?.durationPreset === '1_week') durationDays = 7;
        else if (targetBook.swapTerm?.durationPreset === '2_weeks') durationDays = 14;
        else if (targetBook.swapTerm?.durationPreset === '1_month') durationDays = 30;
        const lentAt = new Date().toISOString();
        const dueAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        newLoanInfo = { lentAt, dueAt };
      }
    } else {
      newStatus = targetBook.status === 'swapped' || targetBook.isCompleted ? 'active' : 'swapped';
    }

    const updated = books.map((b) => {
      if (b.id === bookId) {
        return {
          ...b,
          status: newStatus,
          loanInfo: newLoanInfo,
          isCompleted: newStatus === 'swapped',
        };
      }
      return b;
    });

    persistBooks(updated);
    booksService.updateBookStatus(bookId, newStatus, newLoanInfo).catch((err) => {
      console.warn('Failed to update status on Supabase:', err);
    });

    if (selectedBook && selectedBook.id === bookId) {
      const updatedBook = updated.find((x) => x.id === bookId);
      if (updatedBook) setSelectedBook(updatedBook);
    }

    showToast(
      newStatus === 'temporarily_given'
        ? "Kitob 'Vaqtincha berilgan' deb belgilandi"
        : newStatus === 'swapped'
          ? "Kitob 'Almashildi' deb belgilandi"
          : "Kitob yana faol holatga qaytarildi",
      'success'
    );
  };

  // Direct activate book handler for ProfileTab
  const handleActivateBook = (bookId: string) => {
    const updated = books.map((b) => {
      if (b.id === bookId) {
        return {
          ...b,
          status: 'active' as BookStatus,
          loanInfo: undefined,
          isCompleted: false,
        };
      }
      return b;
    });

    persistBooks(updated);
    booksService.updateBookStatus(bookId, 'active').catch((err) => {
      console.warn('Failed to activate book on Supabase:', err);
    });

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook((prev) =>
        prev
          ? {
            ...prev,
            status: 'active',
            loanInfo: undefined,
            isCompleted: false,
          }
          : null
      );
    }

    showToast("Kitob faollashtirildi va ro'yxatga qaytarildi ✓", 'success');
  };

  // Open public reader profile
  const handleOpenUserProfile = (userId: string) => {
    setSelectedProfileUserId(userId);
    setIsProfileModalOpen(true);
  };

  // Open book details
  const handleOpenDetail = useCallback((book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  }, []);

  // Start in-app chat with book owner
  const handleStartChatFromDetail = (book: Book) => {
    if (!user) {
      openAuthModal("Kitob egasiga xabar yozish uchun tizimga kiring");
      return;
    }
    startConversation(book);
    setCurrentTab('messages');
  };

  // Guarded handler for opening Add Book modal: blocks action if outside Tashkent
  const handleOpenAddBookModal = useCallback(() => {
    if (isOutsideTashkent) {
      setIsRegionBlockedModalOpen(true);
      showToast("Eʼlon joylash hozircha faqat Toshkent shahrida mavjud", 'info');
      return;
    }

    if (!user) {
      openAuthModal("Kitob joylash uchun tizimga kiring");
      return;
    }

    setIsAddModalOpen(true);
  }, [isOutsideTashkent, user, openAuthModal, showToast]);

  // Handle Geolocation permission
  const handleAllowGeo = (coords: { lat: number; lng: number }) => {
    setUserCoordinates(coords);
    setIsGeoPromptOpen(false);
    try {
      sessionStorage.setItem(SESSION_GEO_COORDS_KEY, JSON.stringify(coords));
      localStorage.setItem(STORAGE_GEO_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
    showToast('Joylashuvingiz aniqlandi! Masofalar xaritada koʻrsatiladi.', 'success');
  };

  const handleSkipGeo = () => {
    setIsGeoPromptOpen(false);
    try {
      localStorage.setItem(STORAGE_GEO_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
    // Default gracefully to Tashkent center
    setUserCoordinates(TASHKENT_CENTER);
  };

  // Filtered books based on currentTab, search, feedFilter
  const filteredBooks = useMemo(() => {
    let list = [...books];

    // Filter by tab
    if (currentTab === 'saved') {
      list = list.filter((b) => savedBookIds.has(b.id));
    } else if (currentTab === 'my_listings') {
      list = list.filter((b) => user && b.ownerId === user.id);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.location?.addressText?.toLowerCase().includes(q)
      );
    }

    // Filter by feedFilter (only on home tab)
    if (currentTab === 'home' && feedFilter !== 'all') {
      list = list.filter((b) => {
        const type = b.swapTerm?.type || (b.type === 'gift' ? 'gift' : 'permanent');
        return type === feedFilter;
      });
    }

    // Sort by proximity if user coordinates available
    if (userCoordinates) {
      list.sort((a, b) => {
        const aLat = a.location?.lat ?? a.coordinates?.lat ?? TASHKENT_CENTER.lat;
        const aLng = a.location?.lng ?? a.coordinates?.lng ?? TASHKENT_CENTER.lng;
        const bLat = b.location?.lat ?? b.coordinates?.lat ?? TASHKENT_CENTER.lat;
        const bLng = b.location?.lng ?? b.coordinates?.lng ?? TASHKENT_CENTER.lng;

        const distA = calculateDistanceKm(userCoordinates.lat, userCoordinates.lng, aLat, aLng);
        const distB = calculateDistanceKm(userCoordinates.lat, userCoordinates.lng, bLat, bLng);
        return distA - distB;
      });
    }

    return list;
  }, [books, currentTab, savedBookIds, user, searchQuery, feedFilter, userCoordinates]);

  // Counts
  const myListings = useMemo(() => {
    return books.filter((b) => user && b.ownerId === user.id);
  }, [books, user]);

  const swappedListingsCount = useMemo(() => {
    return myListings.filter((b) => b.status === 'swapped' || b.isCompleted).length;
  }, [myListings]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Geolocation Banner / Prompt */}
      <GeolocationPrompt
        isOpen={isGeoPromptOpen}
        onAllow={handleAllowGeo}
        onSkip={handleSkipGeo}
      />

      {/* Main Header with 📍 Toshkent location trigger */}
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'home') {
            setSearchQuery('');
            setFeedFilter('all');
          }
          setCurrentTab(tab);
        }}
        savedCount={savedBookIds.size}
        myListingsCount={myListings.length}
        unreadChatCount={totalUnreadCount}
        onOpenCitySelector={() => setIsCityModalOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 sm:pb-12">
        {/* Outside Tashkent Notice Banner */}
        {isOutsideTashkent && (
          <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <MapPinOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Joylashuvingiz Toshkentdan tashqarida aniqlandi. Siz kitoblarni koʻrishingiz mumkin, ammo eʼlon joylash faqat Toshkentda ochiq.
              </span>
            </div>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs whitespace-nowrap shadow-xs transition-all active:scale-95 shrink-0"
            >
              Viloyatimga ovoz berish
            </button>
          </div>
        )}

        {/* Profile Tab View (Shaxsiy Kabinet) */}
        {currentTab === 'profile' ? (
          <ProfileTab
            myListingsCount={myListings.length}
            swappedCount={swappedListingsCount}
            savedCount={savedBookIds.size}
            onGoToMyListings={() => setCurrentTab('my_listings')}
            onGoToSaved={() => setCurrentTab('saved')}
            myBooks={myListings}
            onActivateBook={handleActivateBook}
            onOpenBookDetail={handleOpenDetail}
            onOpenAddModal={handleOpenAddBookModal}
            onOpenSupport={() => setIsSupportModalOpen(true)}
          />
        ) : currentTab === 'messages' ? (
          /* Messages Tab View */
          <MessagesTab
            onOpenBookDetail={(bookId) => {
              const b = books.find((x) => x.id === bookId);
              if (b) handleOpenDetail(b);
            }}
            onGoToFeed={() => setCurrentTab('home')}
            onOpenUserProfile={handleOpenUserProfile}
          />
        ) : (
          /* Feed, Saved, or My Listings Tab */
          <>
            {/* Editorial Tab Header */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {currentTab === 'home' && 'Kitoblar lentasi'}
                    {currentTab === 'saved' && 'Saqlangan kitoblar'}
                    {currentTab === 'my_listings' && 'Eʼlonlarim'}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
                    {currentTab === 'home' &&
                      "Toshkent boʻylab kitobxonlar bilan bevosita o'qishga oling yoki almashtiring"}
                    {currentTab === 'saved' &&
                      'Sizga yoqqan va keyinroq bogʻlanish uchun saqlangan kitoblar'}
                    {currentTab === 'my_listings' &&
                      'Joylangan barcha faol, vaqtincha berilgan va almashilgan kitoblar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400 dark:text-zinc-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kitob nomi, muallif yoki tuman boʻyicha qidirish..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 p-0.5 rounded-full text-stone-400 hover:text-stone-600 dark:text-zinc-400 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Horizontal Filter Pills (Only on Home Feed) */}
            {currentTab === 'home' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                <button
                  id="filter-all"
                  onClick={() => setFeedFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.98] border ${
                    feedFilter === 'all'
                      ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900 border-[#141413] dark:border-stone-200 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Barchasi
                </button>

                <button
                  id="filter-temporary"
                  onClick={() => setFeedFilter('temporary')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] border ${
                    feedFilter === 'temporary'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Vaqtinchalik o&#39;qishga</span>
                </button>

                <button
                  id="filter-permanent"
                  onClick={() => setFeedFilter('permanent')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] border ${
                    feedFilter === 'permanent'
                      ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900 border-[#141413] dark:border-stone-200 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Doimiy almashuv</span>
                </button>

                <button
                  id="filter-gift"
                  onClick={() => setFeedFilter('gift')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] border ${
                    feedFilter === 'gift'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Bepul sovg&#39;alar</span>
                </button>
              </div>
            )}

            {/* Results count & clear filters info */}
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 mb-3 font-sans">
              <div className="flex items-center gap-2">
                <span>
                  Topilgan kitoblar: <strong className="text-stone-900 dark:text-stone-100">{filteredBooks.length}</strong> ta
                </span>
                {(searchQuery || (currentTab === 'home' && feedFilter !== 'all')) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFeedFilter('all');
                    }}
                    className="text-amber-700 dark:text-amber-400 hover:underline font-medium ml-1"
                  >
                    Filtrni tozalash
                  </button>
                )}
              </div>
            </div>

            {/* Book Grid, Skeleton, or Clean Production Empty State */}
            {isLoadingBooks ? (
              <BookGridSkeleton count={8} />
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={handleOpenDetail}
                    onToggleSave={handleToggleSave}
                    isSaved={savedBookIds.has(book.id)}
                    isMyListing={currentTab === 'my_listings'}
                    onToggleStatus={handleToggleStatus}
                    onDeleteBook={handleDeleteBook}
                    userCoordinates={userCoordinates}
                    onOpenUserProfile={handleOpenUserProfile}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                tab={currentTab}
                isTotalEmpty={books.length === 0 && currentTab === 'home'}
                onResetFilters={() => {
                  setSearchQuery('');
                  setFeedFilter('all');
                }}
                onOpenAddModal={handleOpenAddBookModal}
                onGoToFeed={() => setCurrentTab('home')}
                onOpenAuthModal={() =>
                  openAuthModal("Shaxsiy eʼlonlaringizni koʻrish uchun tizimga kiring")
                }
                isAuthenticated={!!user}
                searchQuery={searchQuery}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (+ Kitob joylash) - Hidden on empty states to prevent duplication */}
      <FloatingActionButton
        visible={
          filteredBooks.length > 0 &&
          books.length > 0 &&
          (currentTab === 'home' || currentTab === 'my_listings')
        }
        onClick={handleOpenAddBookModal}
      />

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={savedBookIds.size}
        myListingsCount={myListings.length}
        unreadChatCount={totalUnreadCount}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBook(null);
        }}
        onToggleSave={handleToggleSave}
        onDeleteBook={handleDeleteBook}
        onToggleComplete={handleToggleStatus}
        onStartChat={handleStartChatFromDetail}
        onGoToMyListings={() => setCurrentTab('my_listings')}
        onOpenUserProfile={handleOpenUserProfile}
        isSaved={selectedBook ? savedBookIds.has(selectedBook.id) : false}
        userCoordinates={userCoordinates}
      />

      {/* Public User Profile Modal */}
      <UserProfileModal
        userId={selectedProfileUserId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfileUserId(null);
        }}
        onSelectBook={handleOpenDetail}
        currentUser={user}
        allBooks={books}
      />

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBook={handleAddBook}
      />

      {/* Regional Waitlist / City Selector Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        isOutsideTashkent={isOutsideTashkent}
      />

      {/* Region Restriction Modal (Outside Tashkent Guard) */}
      <RegionRestrictionModal
        isOpen={isRegionBlockedModalOpen}
        onClose={() => setIsRegionBlockedModalOpen(false)}
        onOpenVoting={() => setIsCityModalOpen(true)}
        userCoordinates={userCoordinates}
      />

      {/* Support / Feedback Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
}
