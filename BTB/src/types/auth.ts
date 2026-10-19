export interface UserProfile {
  id: string;
  name: string;
  contact: string;                 // Phone or Telegram username
  email?: string;
  city: string;                    // Default: "Toshkent"
  favoriteGenres?: string[];       // e.g., ["Biznes va moliya", "Jahon adabiyoti"]
  wishlistBooks?: string[];        // Books the user is looking for in exchange
  createdAt: string;
  avatar?: string;
  avatar_url?: string;             // Schema cache compatibility
  role?: 'admin' | 'user';         // Role Based Access Control
  provider?: 'google' | 'telegram' | 'direct' | 'guest';
  telegramUsername?: string;
}

export type User = UserProfile;

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithProfile: (profile: {
    name: string;
    contact: string;
    email?: string;
    city?: string;
    avatar?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
    provider?: 'google' | 'telegram' | 'direct' | 'guest';
    telegramUsername?: string;
  }) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  loginWithTelegram: (username?: string, name?: string) => void;
  loginAsGuest: (name: string, contact?: string, email?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
}
