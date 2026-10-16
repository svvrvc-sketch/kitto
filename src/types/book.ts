export type AppTab = 'home' | 'saved' | 'messages' | 'my_listings' | 'profile';

export type SwapType = 'temporary' | 'permanent' | 'gift';
export type DurationPreset = '1_week' | '2_weeks' | '1_month' | 'until_finished';

export interface SwapTerm {
  type: SwapType;
  durationPreset?: DurationPreset; // Used when type === 'temporary'
  durationLabel: string;           // e.g., "2 haftaga o'qishga", "Doimiy almashuv", "Bepul sovg'a"
  returnConditionNote?: string;    // Optional note from owner
  durationWeeks?: number;          // Backward compatibility
  customDurationText?: string;     // Backward compatibility
}

export interface BookLocation {
  lat: number;
  lng: number;
  addressText: string;             // Reverse-geocoded street/district in Tashkent
}

export type BookCondition = 'yangi' | 'yaxshi' | 'oʻqilgan' | string;
export type BookType = 'swap' | 'gift';

export interface BookLoanInfo {
  lentAt: string;                // ISO timestamp
  dueAt: string;                 // ISO timestamp calculated from durationPreset
}

export type BookStatus = 'active' | 'temporarily_given' | 'swapped';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  condition: BookCondition;
  description?: string;
  coverUrl?: string;
  ownerId: string;
  ownerName: string;
  ownerContact: string;
  city: string;                    // Default: "Toshkent"
  location: BookLocation;
  swapTerm: SwapTerm;
  status: BookStatus;
  loanInfo?: BookLoanInfo;
  ownerFavoriteGenres?: string[];
  ownerWishlist?: string[];
  createdAt: string;

  // Backward-compatible fields
  type?: BookType;
  ownerCity?: string;
  exactLocation?: string;
  coordinates?: { lat: number; lng: number };
  telegramUsername?: string;
  wishlist?: string;
  genre?: string;
  isCompleted?: boolean;
  viewsCount?: number;
}

export type FeedFilterType = 'all' | 'temporary' | 'permanent' | 'gift';
export type FilterType = 'all' | 'swap' | 'gift' | 'temporary' | 'permanent';
