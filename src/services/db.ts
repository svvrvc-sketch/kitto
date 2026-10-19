/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Book, BookStatus, BookLoanInfo } from '@/types/book';
import { UserProfile } from '@/types/auth';
import { ChatThread, ChatMessage } from '@/types/chat';
import { ExchangeTransaction, ExchangeTransactionStatus } from '@/types/exchange';

// Storage keys for offline cache & localStorage fallback
export const STORAGE_BOOKS_KEY = 'kitto_books';
export const STORAGE_USER_KEY = 'kitto_user';
export const STORAGE_CHATS_KEY = 'kitto_chats';
export const STORAGE_VOTES_KEY = 'kitto_region_votes';
export const STORAGE_SAVED_KEY = 'kitto_saved_ids';
export const STORAGE_EXCHANGE_KEY = 'kitto_exchange_transactions';

const TASHKENT_DEFAULT_LOCATION = {
  lat: 41.311081,
  lng: 69.240562,
  addressText: 'Toshkent shahri',
};

// ==============================================================================
// 1. DATA MAPPERS (PostgreSQL snake_case <-> TypeScript camelCase)
// ==============================================================================

export function mapRowToBook(row: any): Book {
  if (!row || typeof row !== 'object') {
    return {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: 'Kitob',
      author: 'Muallif',
      category: 'Badiiy',
      condition: 'yaxshi',
      ownerId: 'owner',
      ownerName: 'Kitobxon',
      ownerContact: '+998 90 000 00 00',
      city: 'Toshkent',
      location: TASHKENT_DEFAULT_LOCATION,
      swapTerm: { type: 'permanent', durationLabel: 'Doimiy almashuv' },
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }

  const swapTermType =
    row.swap_term?.type ||
    row.swapTerm?.type ||
    (row.type === 'gift' ? 'gift' : 'permanent');

  const durationLabel =
    row.swap_term?.durationLabel ||
    row.swapTerm?.durationLabel ||
    (swapTermType === 'gift'
      ? "Bepul sovg'a"
      : swapTermType === 'temporary'
      ? "2 haftaga o'qishga"
      : 'Doimiy almashuv');

  const rawLoc = typeof row.location === 'object' && row.location !== null ? row.location : {};
  const location = {
    lat: typeof rawLoc.lat === 'number' ? rawLoc.lat : (row.coordinates?.lat ?? TASHKENT_DEFAULT_LOCATION.lat),
    lng: typeof rawLoc.lng === 'number' ? rawLoc.lng : (row.coordinates?.lng ?? TASHKENT_DEFAULT_LOCATION.lng),
    addressText:
      rawLoc.addressText ||
      (typeof row.location === 'string' ? row.location : undefined) ||
      row.exact_location ||
      row.exactLocation ||
      row.city ||
      TASHKENT_DEFAULT_LOCATION.addressText,
  };

  const status: BookStatus = row.status || (row.is_completed ? 'swapped' : 'active');

  return {
    id: String(row.id || `book_${Date.now()}`),
    title: String(row.title || 'Nomsiz kitob'),
    author: String(row.author || 'Muallif nomaʼlum'),
    category: String(row.category || 'Badiiy adabiyot'),
    condition: String(row.condition || 'yaxshi'),
    description: String(row.description || ''),
    coverUrl: row.cover_url || row.coverUrl || undefined,
    ownerId: String(row.owner_id || row.ownerId || 'owner'),
    ownerName: String(row.owner_name || row.ownerName || 'Kitobxon'),
    ownerContact: String(row.owner_contact || row.ownerContact || '+998 90 123 45 67'),
    city: String(row.city || 'Toshkent'),
    location,
    swapTerm: {
      type: swapTermType,
      durationPreset:
        row.swap_term?.durationPreset ||
        row.swapTerm?.durationPreset ||
        (swapTermType === 'temporary' ? '2_weeks' : undefined),
      durationLabel,
      returnConditionNote: row.swap_term?.returnConditionNote || row.swapTerm?.returnConditionNote,
    },
    status,
    loanInfo: row.loan_info || row.loanInfo || undefined,
    ownerFavoriteGenres: Array.isArray(row.owner_favorite_genres)
      ? row.owner_favorite_genres
      : Array.isArray(row.ownerFavoriteGenres)
      ? row.ownerFavoriteGenres
      : [],
    ownerWishlist: Array.isArray(row.owner_wishlist)
      ? row.owner_wishlist
      : Array.isArray(row.ownerWishlist)
      ? row.ownerWishlist
      : [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    // Backward compatibility aliases
    type: swapTermType === 'gift' ? 'gift' : 'swap',
    exactLocation: location.addressText,
    coordinates: { lat: location.lat, lng: location.lng },
    isCompleted: status === 'swapped',
  };
}

export function mapBookToRow(book: Book): Record<string, any> {
  const swapTerm = {
    ...(typeof book.swapTerm === 'object' ? book.swapTerm : { type: 'permanent', durationLabel: 'Doimiy almashuv' }),
    ownerFavoriteGenres: book.ownerFavoriteGenres || [],
    ownerWishlist: book.ownerWishlist || [],
  };

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    condition: book.condition,
    description: book.description || null,
    cover_url: book.coverUrl || null,
    owner_id: book.ownerId,
    owner_name: book.ownerName,
    owner_contact: book.ownerContact,
    city: book.city || 'Toshkent',
    location: book.location || TASHKENT_DEFAULT_LOCATION,
    swap_term: swapTerm,
    status: book.status || 'active',
    loan_info: book.loanInfo || null,
    created_at: book.createdAt || new Date().toISOString(),
  };
}

export function mapRowToProfile(row: any): UserProfile {
  const avatarVal = row.avatar || row.avatar_url || undefined;
  return {
    id: String(row.id),
    name: row.name,
    contact: row.contact,
    email: row.email || undefined,
    city: row.city || 'Toshkent',
    favoriteGenres: row.favorite_genres || [],
    wishlistBooks: row.wishlist_books || [],
    avatar: avatarVal,
    avatar_url: avatarVal,
    role: (row.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    provider: row.provider || 'direct',
    telegramUsername: row.telegram_username || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapProfileToRow(profile: UserProfile): Record<string, any> {
  return {
    id: profile.id,
    name: profile.name,
    contact: profile.contact,
    city: profile.city || 'Toshkent',
    favorite_genres: profile.favoriteGenres || [],
    wishlist_books: profile.wishlistBooks || [],
    created_at: profile.createdAt || new Date().toISOString(),
  };
}


export function mapRowToChat(row: any): ChatThread {
  if (!row || typeof row !== 'object') {
    return {
      id: `chat_${Date.now()}`,
      bookId: 'book',
      bookTitle: 'Kitob',
      bookSwapLabel: 'Almashuv',
      ownerId: 'owner',
      ownerName: 'Kitobxon',
      initiatorId: 'initiator',
      initiatorName: 'Kitobxon',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const messages: ChatMessage[] = Array.isArray(row.messages)
    ? row.messages
        .filter((m: any) => m && typeof m === 'object')
        .map((m: any) => ({
          id: String(m.id || `msg_${Date.now()}`),
          senderId: String(m.senderId || m.sender_id || 'sender'),
          text: String(m.text || ''),
          createdAt: String(m.createdAt || m.created_at || new Date().toISOString()),
          isRead: Boolean(m.isRead ?? m.is_read ?? false),
          type: m.type || 'text',
          proposal: m.proposal && typeof m.proposal === 'object' ? m.proposal : undefined,
        }))
    : [];

  return {
    id: String(row.id || `chat_${Date.now()}`),
    bookId: String(row.book_id || row.bookId || 'book'),
    bookTitle: String(row.book_title || row.bookTitle || 'Kitob'),
    bookCover: row.book_cover || row.bookCover || undefined,
    bookSwapLabel: String(row.book_swap_label || row.bookSwapLabel || 'Almashuv'),
    ownerId: String(row.owner_id || row.ownerId || 'owner'),
    ownerName: String(row.owner_name || row.ownerName || 'Kitobxon'),
    initiatorId: String(row.initiator_id || row.initiatorId || 'initiator'),
    initiatorName: String(row.initiator_name || row.initiatorName || 'Kitobxon'),
    messages,
    updatedAt: String(row.updated_at || row.updatedAt || new Date().toISOString()),
  };
}

export function mapChatToRow(chat: ChatThread): Record<string, any> {
  return {
    id: chat.id,
    book_id: chat.bookId,
    book_title: chat.bookTitle,
    book_cover: chat.bookCover || null,
    book_swap_label: chat.bookSwapLabel,
    owner_id: chat.ownerId,
    owner_name: chat.ownerName,
    initiator_id: chat.initiatorId,
    initiator_name: chat.initiatorName,
    messages: chat.messages || [],
    updated_at: chat.updatedAt || new Date().toISOString(),
  };
}

// ==============================================================================
// 2. BOOKS SERVICE (Optimized SWR & In-Memory Cache)
// ==============================================================================

let inMemoryBooksCache: Book[] | null = null;
let lastBooksFetchTimestamp = 0;
const BOOKS_CACHE_TTL = 30000; // 30 seconds fresh memory cache

export const booksService = {
  /**
   * Clears in-memory books cache when needed.
   */
  clearCache(): void {
    inMemoryBooksCache = null;
    lastBooksFetchTimestamp = 0;
  },

  /**
   * Fetches books from Supabase with instant memory/local cache (SWR).
   */
  async getBooks(forceRefresh = false): Promise<Book[]> {
    const now = Date.now();
    if (!forceRefresh && inMemoryBooksCache && now - lastBooksFetchTimestamp < BOOKS_CACHE_TTL) {
      return inMemoryBooksCache;
    }

    // Read local cache for instant initial paint
    let localBooks: Book[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored =
          localStorage.getItem(STORAGE_BOOKS_KEY) ||
          localStorage.getItem('bookswap_books');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localBooks = parsed.map(mapRowToBook);
            if (!inMemoryBooksCache) inMemoryBooksCache = localBooks;
          }
        }
      } catch (e) {
        console.error('Error reading books from localStorage:', e);
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mappedBooks = data.map(mapRowToBook);
          inMemoryBooksCache = mappedBooks;
          lastBooksFetchTimestamp = Date.now();

          // Sync to offline cache
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(mappedBooks));

              // Auto-sync any previously stuck local books to Supabase
              if (localBooks.length > 0) {
                const remoteIds = new Set(mappedBooks.map((b) => b.id));
                const unsynced = localBooks.filter((b) => !remoteIds.has(b.id));
                if (unsynced.length > 0) {
                  for (const ub of unsynced) {
                    const row = mapBookToRow(ub);
                    supabase.from('books').insert(row).then(({ error: syncErr }) => {
                      if (!syncErr) {
                        console.log('[Kitto] Auto-synced previous book to cloud:', ub.title);
                      }
                    }).catch(() => {});
                  }
                }
              }
            }
          } catch (e) {
            console.warn('Could not cache books to localStorage:', e);
          }
          return mappedBooks;
        }
        if (error) {
          console.warn('Supabase getBooks error, falling back to local cache:', error.message);
        }
      } catch (err) {
        console.warn('Network error while querying Supabase books:', err);
      }
    }

    return inMemoryBooksCache || localBooks;
  },

  /**
   * Adds a new book listing to Supabase and caches to localStorage.
   */
  async addBook(book: Book): Promise<Book> {
    booksService.clearCache();

    // 1. Sync to Supabase Cloud FIRST
    if (isSupabaseConfigured) {
      try {
        const row = mapBookToRow(book);
        const { error } = await supabase.from('books').insert(row);
        if (error) {
          console.error('[Kitto Cloud] Supabase addBook primary error:', error.message);
          // Fallback insert with essential columns
          const minimalRow = {
            id: row.id,
            title: row.title,
            author: row.author,
            category: row.category,
            condition: row.condition,
            description: row.description,
            cover_url: row.cover_url,
            owner_id: row.owner_id,
            owner_name: row.owner_name,
            owner_contact: row.owner_contact,
            city: row.city,
            location: row.location,
            swap_term: row.swap_term,
            status: row.status,
            loan_info: row.loan_info,
            created_at: row.created_at,
          };
          const { error: retryError } = await supabase.from('books').insert(minimalRow);
          if (retryError) {
            console.error('[Kitto Cloud] Supabase addBook fallback error:', retryError.message);
          } else {
            console.log('[Kitto Cloud] Book successfully saved via fallback!');
          }
        } else {
          console.log('[Kitto Cloud] Book successfully published to Supabase:', book.title);
        }
      } catch (err) {
        console.error('Network error adding book to Supabase:', err);
      }
    }

    // 2. Immediately cache to local storage & memory
    if (typeof window !== 'undefined') {
      try {
        const cached = await booksService.getBooks(true);
        const updated = [book, ...cached.filter((b) => b.id !== book.id)];
        localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated));
        inMemoryBooksCache = updated;
        lastBooksFetchTimestamp = Date.now();
      } catch (e) {
        console.error('Local cache error:', e);
      }
    }

    return book;
  },

  /**
   * Updates book status (e.g. 'active', 'temporarily_given', 'swapped')
   */
  async updateBookStatus(
    bookId: string,
    status: BookStatus,
    loanInfo?: BookLoanInfo
  ): Promise<void> {
    // 1. Update localStorage & memory
    booksService.clearCache();
    if (typeof window !== 'undefined') {
      try {
        const cached = await booksService.getBooks();
        const updated = cached.map((b) =>
          b.id === bookId
            ? {
                ...b,
                status,
                loanInfo: loanInfo || undefined,
                isCompleted: status === 'swapped',
              }
            : b
        );
        localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated));
        inMemoryBooksCache = updated;
        lastBooksFetchTimestamp = Date.now();
      } catch (e) {
        console.error('Local cache error:', e);
      }
    }

    // 2. Update Supabase
    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          status,
          loan_info: loanInfo || null,
        };
        const { error } = await supabase
          .from('books')
          .update(payload)
          .eq('id', bookId);
        if (error) {
          console.error('Supabase updateBookStatus error:', error.message);
        }
      } catch (err) {
        console.error('Network error updating status on Supabase:', err);
      }
    }
  },

  /**
   * Updates multiple book fields (e.g., owner profile sync)
   */
  async updateBook(bookId: string, updates: Partial<Book>): Promise<void> {
    // 1. Update local cache
    if (typeof window !== 'undefined') {
      try {
        const cached = await booksService.getBooks();
        const updated = cached.map((b) =>
          b.id === bookId ? { ...b, ...updates } : b
        );
        localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Local cache error:', e);
      }
    }

    // 2. Update Supabase
    if (isSupabaseConfigured) {
      try {
        const rowUpdates: Record<string, any> = {};
        if (updates.title !== undefined) rowUpdates.title = updates.title;
        if (updates.author !== undefined) rowUpdates.author = updates.author;
        if (updates.category !== undefined) rowUpdates.category = updates.category;
        if (updates.condition !== undefined) rowUpdates.condition = updates.condition;
        if (updates.description !== undefined) rowUpdates.description = updates.description;
        if (updates.coverUrl !== undefined) rowUpdates.cover_url = updates.coverUrl;
        if (updates.ownerName !== undefined) rowUpdates.owner_name = updates.ownerName;
        if (updates.ownerContact !== undefined) rowUpdates.owner_contact = updates.ownerContact;
        if (updates.status !== undefined) rowUpdates.status = updates.status;
        if (updates.loanInfo !== undefined) rowUpdates.loan_info = updates.loanInfo;

        if (Object.keys(rowUpdates).length > 0) {
          const { error } = await supabase
            .from('books')
            .update(rowUpdates)
            .eq('id', bookId);
          if (error) {
            console.error('Supabase updateBook error:', error.message);
          }
        }
      } catch (err) {
        console.error('Network error updating book on Supabase:', err);
      }
    }
  },

  /**
   * Deletes a book listing from Supabase and localStorage.
   */
  async deleteBook(bookId: string): Promise<void> {
    // 1. Delete from local cache & memory
    booksService.clearCache();
    if (typeof window !== 'undefined') {
      try {
        const cached = await booksService.getBooks();
        const updated = cached.filter((b) => b.id !== bookId);
        localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated));
        inMemoryBooksCache = updated;
        lastBooksFetchTimestamp = Date.now();
      } catch (e) {
        console.error('Local cache error:', e);
      }
    }

    // 2. Delete from Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('books').delete().eq('id', bookId);
        if (error) {
          console.error('Supabase deleteBook error:', error.message);
        }
      } catch (err) {
        console.error('Network error deleting book on Supabase:', err);
      }
    }
  },

  /**
   * Subscribes to real-time changes on the books table.
   */
  subscribeToBooks(onEvent: (payload: any) => void): () => void {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('realtime_books')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'books' },
          (payload) => {
            onEvent(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Failed to subscribe to books channel:', e);
      return () => {};
    }
  },
};

// ==============================================================================
// 3. PROFILES SERVICE
// ==============================================================================

export const profilesService = {
  /**
   * Fetches user profile by ID.
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return mapRowToProfile(data);
        }
      } catch (err) {
        console.warn('Network error fetching profile:', err);
      }
    }

    // Fallback to local storage
    if (typeof window !== 'undefined') {
      try {
        const stored =
          localStorage.getItem(STORAGE_USER_KEY) ||
          localStorage.getItem('bookswap_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id === userId) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('LocalStorage profile read error:', e);
      }
    }
    return null;
  },

  /**
   * Upserts user profile in Supabase and saves to local storage.
   */
  async upsertProfile(profile: UserProfile): Promise<void> {
    // 1. Cache to local storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to save profile to localStorage:', e);
      }
    }

    // 2. Upsert to Supabase
    if (isSupabaseConfigured) {
      try {
        const row = mapProfileToRow(profile);
        
        // Attempt 1: Full object with avatar and avatar_url
        let { error } = await supabase
          .from('profiles')
          .upsert(row, { onConflict: 'id' });

        // If schema cache lacks 'avatar' column, fallback without 'avatar' (using avatar_url)
        if (error && error.message && error.message.includes("'avatar'")) {
          const fallbackRow = { ...row };
          delete fallbackRow.avatar;
          const retryResult = await supabase
            .from('profiles')
            .upsert(fallbackRow, { onConflict: 'id' });
          error = retryResult.error;
        }

        // If schema cache lacks 'avatar_url' column, fallback without 'avatar_url' (using avatar)
        if (error && error.message && error.message.includes("'avatar_url'")) {
          const fallbackRow = { ...row };
          delete fallbackRow.avatar_url;
          const retryResult = await supabase
            .from('profiles')
            .upsert(fallbackRow, { onConflict: 'id' });
          error = retryResult.error;
        }

        // If schema cache lacks 'role' column, fallback without 'role'
        if (error && error.message && error.message.includes("'role'")) {
          const fallbackRow = { ...row };
          delete fallbackRow.role;
          const retryResult = await supabase
            .from('profiles')
            .upsert(fallbackRow, { onConflict: 'id' });
          error = retryResult.error;
        }

        if (error) {
          console.warn('Supabase upsertProfile notice:', error.message);
        }
      } catch (err) {
        console.warn('Network notice saving profile to Supabase:', err);
      }
    }
  },
};

// ==============================================================================
// 4. CHATS SERVICE
// ==============================================================================

export const chatsService = {
  /**
   * Fetches chat threads for a specific user (as owner or initiator).
   */
  async getChats(userId?: string): Promise<ChatThread[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .or(`owner_id.eq.${userId},initiator_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mappedChats = data.map(mapRowToChat);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(mappedChats));
            } catch (e) {
              console.warn('LocalStorage chat cache error:', e);
            }
          }
          return mappedChats;
        }
      } catch (err) {
        console.warn('Network error querying Supabase chats:', err);
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored =
          localStorage.getItem(STORAGE_CHATS_KEY) ||
          localStorage.getItem('bookswap_chats');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.map(mapRowToChat);
          }
        }
      } catch (e) {
        console.error('Error reading chats from localStorage:', e);
      }
    }
    return [];
  },

  /**
   * Saves or updates a chat thread in Supabase and localStorage.
   */
  async saveChat(chat: ChatThread): Promise<void> {
    // 1. Cache to local storage
    if (typeof window !== 'undefined') {
      try {
        const stored =
          localStorage.getItem(STORAGE_CHATS_KEY) ||
          localStorage.getItem('bookswap_chats');
        let currentChats: ChatThread[] = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) currentChats = parsed;
          } catch {
            // ignore
          }
        }
        const updated = [chat, ...currentChats.filter((c) => c.id !== chat.id)];
        localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage chat save error:', e);
      }
    }

    // 2. Upsert to Supabase
    if (isSupabaseConfigured) {
      try {
        const row = mapChatToRow(chat);
        const { error } = await supabase
          .from('chats')
          .upsert(row, { onConflict: 'id' });
        if (error) {
          console.error('Supabase saveChat error:', error.message);
        }
      } catch (err) {
        console.error('Network error saving chat to Supabase:', err);
      }
    }
  },

  /**
   * Realtime subscription for user's chats
   */
  subscribeToChats(userId: string, onEvent: (payload: any) => void): () => void {
    if (!isSupabaseConfigured || !userId) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`realtime_chats_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chats',
          },
          (payload) => {
            onEvent(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Failed to subscribe to chats:', e);
      return () => {};
    }
  },
};

// ==============================================================================
// 5. REGIONAL VOTES SERVICE
// ==============================================================================

export const votesService = {
  /**
   * Fetches the current vote counts for all regions.
   */
  async getVotes(): Promise<Record<string, number>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('regional_votes')
          .select('region_id, votes_count');

        if (!error && Array.isArray(data)) {
          const voteMap: Record<string, number> = {};
          data.forEach((row) => {
            voteMap[row.region_id] = Number(row.votes_count) || 0;
          });
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(voteMap));
            } catch (e) {
              console.warn('LocalStorage votes cache error:', e);
            }
          }
          return voteMap;
        }
      } catch (err) {
        console.warn('Network error querying regional votes:', err);
      }
    }

    // Fallback to local storage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_VOTES_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error reading votes from localStorage:', e);
      }
    }
    return {};
  },

  /**
   * Casts a vote for a region.
   */
  async voteRegion(regionId: string): Promise<number> {
    let newCount = 1;

    // 1. Update localStorage
    if (typeof window !== 'undefined') {
      try {
        const current = await votesService.getVotes();
        newCount = (current[regionId] || 0) + 1;
        current[regionId] = newCount;
        localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(current));
        localStorage.setItem('kitto_user_voted_region', regionId);
      } catch (e) {
        console.error('LocalStorage vote update error:', e);
      }
    }

    // 2. Supabase Cloud Sync via RPC or upsert
    if (isSupabaseConfigured) {
      try {
        // Try atomic RPC first
        const { data: rpcData, error: rpcError } = await supabase.rpc('increment_region_vote', {
          target_region_id: regionId,
        });

        if (!rpcError && typeof rpcData === 'number') {
          newCount = rpcData;
        } else {
          // Fallback to direct upsert if RPC is not deployed yet
          const { data: selectData } = await supabase
            .from('regional_votes')
            .select('votes_count')
            .eq('region_id', regionId)
            .single();

          const countToSet = ((selectData?.votes_count as number) || 0) + 1;
          await supabase
            .from('regional_votes')
            .upsert({ region_id: regionId, votes_count: countToSet });
          newCount = countToSet;
        }
      } catch (err) {
        console.error('Network error incrementing vote in Supabase:', err);
      }
    }

    return newCount;
  },

  /**
   * Realtime subscription for live vote counts updates
   */
  subscribeToVotes(onEvent: (payload: any) => void): () => void {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('realtime_regional_votes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'regional_votes' },
          (payload) => {
            onEvent(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Failed to subscribe to votes channel:', e);
      return () => {};
    }
  },
};

// ==============================================================================
// 6. EXCHANGE TRANSACTIONS SERVICE
// ==============================================================================

export const exchangeTransactionsService = {
  /**
   * Creates a new exchange transaction proposal in Supabase & local cache.
   */
  async createTransaction(transaction: ExchangeTransaction): Promise<ExchangeTransaction> {
    // 1. Save to local storage cache
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_EXCHANGE_KEY);
        let list: ExchangeTransaction[] = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) list = parsed;
          } catch {
            // ignore
          }
        }
        const updated = [transaction, ...list.filter((x) => x.id !== transaction.id)];
        localStorage.setItem(STORAGE_EXCHANGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage exchange transaction save error:', e);
      }
    }

    // 2. Persist to Supabase exchange_transactions table
    if (isSupabaseConfigured) {
      try {
        const row = {
          id: transaction.id,
          initiator_book_id: transaction.initiator_book_id,
          target_book_id: transaction.target_book_id,
          owner_id: transaction.owner_id,
          borrower_id: transaction.borrower_id,
          status: transaction.status,
          created_at: transaction.created_at || new Date().toISOString(),
          updated_at: transaction.updated_at || new Date().toISOString(),
        };

        const { error } = await supabase.from('exchange_transactions').upsert(row, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase exchange_transactions upsert warning:', error.message);
        }
      } catch (err) {
        console.warn('Network error saving exchange transaction to Supabase:', err);
      }
    }

    return transaction;
  },

  /**
   * Updates an existing transaction's status.
   */
  async updateTransactionStatus(
    id: string,
    status: ExchangeTransactionStatus
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_EXCHANGE_KEY);
        if (stored) {
          const list: ExchangeTransaction[] = JSON.parse(stored);
          const updated = list.map((item) =>
            item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item
          );
          localStorage.setItem(STORAGE_EXCHANGE_KEY, JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Local update transaction status error:', e);
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('exchange_transactions')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) {
          console.warn('Supabase update transaction status error:', error.message);
        }
      } catch (err) {
        console.warn('Network error updating exchange transaction status on Supabase:', err);
      }
    }
  },

  /**
   * Retrieves exchange transactions for a user (as borrower or owner).
   */
  async getTransactions(userId?: string): Promise<ExchangeTransaction[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('exchange_transactions')
          .select('*')
          .or(`owner_id.eq.${userId},borrower_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((r: any) => ({
            id: String(r.id),
            initiator_book_id: String(r.initiator_book_id),
            target_book_id: String(r.target_book_id),
            owner_id: String(r.owner_id),
            borrower_id: String(r.borrower_id),
            status: r.status as ExchangeTransactionStatus,
            created_at: String(r.created_at),
            updated_at: r.updated_at ? String(r.updated_at) : undefined,
          }));
        }
      } catch (err) {
        console.warn('Network error querying exchange transactions:', err);
      }
    }

    // LocalStorage fallback
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_EXCHANGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            if (!userId) return parsed;
            return parsed.filter(
              (x: ExchangeTransaction) => x.owner_id === userId || x.borrower_id === userId
            );
          }
        }
      } catch (e) {
        console.warn('LocalStorage read transactions error:', e);
      }
    }

    return [];
  },
};
