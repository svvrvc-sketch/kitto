/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Book, BookStatus, BookLoanInfo } from '@/types/book';
import { UserProfile } from '@/types/auth';
import { ChatThread, ChatMessage } from '@/types/chat';

// Storage keys for offline cache & localStorage fallback
export const STORAGE_BOOKS_KEY = 'kitto_books';
export const STORAGE_USER_KEY = 'kitto_user';
export const STORAGE_CHATS_KEY = 'kitto_chats';
export const STORAGE_VOTES_KEY = 'kitto_region_votes';
export const STORAGE_SAVED_KEY = 'kitto_saved_ids';

const TASHKENT_DEFAULT_LOCATION = {
  lat: 41.311081,
  lng: 69.240562,
  addressText: 'Toshkent shahri',
};

// ==============================================================================
// 1. DATA MAPPERS (PostgreSQL snake_case <-> TypeScript camelCase)
// ==============================================================================

export function mapRowToBook(row: any): Book {
  const swapTermType = row.swap_term?.type || (row.type === 'gift' ? 'gift' : 'permanent');
  const durationLabel =
    row.swap_term?.durationLabel ||
    (swapTermType === 'gift'
      ? "Bepul sovg'a"
      : swapTermType === 'temporary'
      ? "2 haftaga o'qishga"
      : 'Doimiy almashuv');

  const location = row.location || {
    lat: row.coordinates?.lat ?? TASHKENT_DEFAULT_LOCATION.lat,
    lng: row.coordinates?.lng ?? TASHKENT_DEFAULT_LOCATION.lng,
    addressText: row.exact_location || row.city || TASHKENT_DEFAULT_LOCATION.addressText,
  };

  const status: BookStatus = row.status || (row.is_completed ? 'swapped' : 'active');

  return {
    id: String(row.id),
    title: row.title || 'Nomsiz kitob',
    author: row.author || 'Muallif nomaʼlum',
    category: row.category || 'Badiiy adabiyot',
    condition: row.condition || 'yaxshi',
    description: row.description || '',
    coverUrl: row.cover_url || row.coverUrl || undefined,
    ownerId: row.owner_id || row.ownerId || 'owner',
    ownerName: row.owner_name || row.ownerName || 'Kitobxon',
    ownerContact: row.owner_contact || row.ownerContact || '+998 90 123 45 67',
    city: row.city || 'Toshkent',
    location: {
      lat: location.lat ?? TASHKENT_DEFAULT_LOCATION.lat,
      lng: location.lng ?? TASHKENT_DEFAULT_LOCATION.lng,
      addressText: location.addressText || 'Toshkent shahri',
    },
    swapTerm: {
      type: swapTermType,
      durationPreset: row.swap_term?.durationPreset || (swapTermType === 'temporary' ? '2_weeks' : undefined),
      durationLabel,
      returnConditionNote: row.swap_term?.returnConditionNote,
    },
    status,
    loanInfo: row.loan_info || undefined,
    ownerFavoriteGenres: row.owner_favorite_genres || row.ownerFavoriteGenres || [],
    ownerWishlist: row.owner_wishlist || row.ownerWishlist || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    // Backward compatibility aliases
    type: swapTermType === 'gift' ? 'gift' : 'swap',
    exactLocation: location.addressText,
    coordinates: { lat: location.lat, lng: location.lng },
    isCompleted: status === 'swapped',
  };
}

export function mapBookToRow(book: Book): Record<string, any> {
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
    swap_term: book.swapTerm,
    status: book.status || 'active',
    loan_info: book.loanInfo || null,
    owner_favorite_genres: book.ownerFavoriteGenres || [],
    owner_wishlist: book.ownerWishlist || [],
    created_at: book.createdAt || new Date().toISOString(),
  };
}

export function mapRowToProfile(row: any): UserProfile {
  return {
    id: String(row.id),
    name: row.name,
    contact: row.contact,
    email: row.email || undefined,
    city: row.city || 'Toshkent',
    favoriteGenres: row.favorite_genres || [],
    wishlistBooks: row.wishlist_books || [],
    avatar: row.avatar || undefined,
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
    email: profile.email || null,
    city: profile.city || 'Toshkent',
    favorite_genres: profile.favoriteGenres || [],
    wishlist_books: profile.wishlistBooks || [],
    avatar: profile.avatar || null,
    provider: profile.provider || 'direct',
    telegram_username: profile.telegramUsername || null,
    created_at: profile.createdAt || new Date().toISOString(),
  };
}

export function mapRowToChat(row: any): ChatThread {
  const messages: ChatMessage[] = Array.isArray(row.messages)
    ? row.messages.map((m: any) => ({
        id: String(m.id || `msg_${Date.now()}`),
        senderId: String(m.senderId || m.sender_id || 'sender'),
        text: String(m.text || ''),
        createdAt: String(m.createdAt || m.created_at || new Date().toISOString()),
        isRead: Boolean(m.isRead ?? m.is_read ?? false),
      }))
    : [];

  return {
    id: String(row.id),
    bookId: String(row.book_id || row.bookId),
    bookTitle: String(row.book_title || row.bookTitle || 'Kitob'),
    bookCover: row.book_cover || row.bookCover || undefined,
    bookSwapLabel: String(row.book_swap_label || row.bookSwapLabel || 'Almashuv'),
    ownerId: String(row.owner_id || row.ownerId),
    ownerName: String(row.owner_name || row.ownerName || 'Kitobxon'),
    initiatorId: String(row.initiator_id || row.initiatorId),
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
// 2. BOOKS SERVICE
// ==============================================================================

export const booksService = {
  /**
   * Fetches books from Supabase (or fallback to localStorage).
   * Automatically updates localStorage cache on successful cloud response.
   */
  async getBooks(): Promise<Book[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mappedBooks = data.map(mapRowToBook);
          // Sync to offline cache
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(mappedBooks));
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

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored =
          localStorage.getItem(STORAGE_BOOKS_KEY) ||
          localStorage.getItem('bookswap_books');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.map(mapRowToBook);
          }
        }
      } catch (e) {
        console.error('Error reading books from localStorage:', e);
      }
    }
    return [];
  },

  /**
   * Adds a new book listing to Supabase and caches to localStorage.
   */
  async addBook(book: Book): Promise<Book> {
    // 1. Immediately cache to local storage
    if (typeof window !== 'undefined') {
      try {
        const cached = await booksService.getBooks();
        const updated = [book, ...cached.filter((b) => b.id !== book.id)];
        localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Local cache error:', e);
      }
    }

    // 2. Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        const row = mapBookToRow(book);
        const { error } = await supabase.from('books').insert(row);
        if (error) {
          console.error('Supabase addBook error:', error.message);
        }
      } catch (err) {
        console.error('Network error adding book to Supabase:', err);
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
    // 1. Update localStorage
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
        if (updates.ownerFavoriteGenres !== undefined) rowUpdates.owner_favorite_genres = updates.ownerFavoriteGenres;
        if (updates.ownerWishlist !== undefined) rowUpdates.owner_wishlist = updates.ownerWishlist;
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
    // 1. Delete from local cache
    if (typeof window !== 'undefined') {
      try {
        const cached = await booksService.getBooks();
        const updated = cached.filter((b) => b.id !== bookId);
        localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated));
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
        const { error } = await supabase
          .from('profiles')
          .upsert(row, { onConflict: 'id' });
        if (error) {
          console.error('Supabase upsertProfile error:', error.message);
        }
      } catch (err) {
        console.error('Network error saving profile to Supabase:', err);
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
