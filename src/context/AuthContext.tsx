'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthContextType } from '@/types/auth';
import { Book } from '@/types/book';
import { profilesService, booksService, STORAGE_USER_KEY } from '@/services/db';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  // Strict SSR mount guard: default null (Guest mode), zero fake auto-login
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY) || localStorage.getItem('bookswap_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
          setUser(parsed);
          // Asynchronously sync fresh profile from cloud
          profilesService.getProfile(parsed.id).then((fresh) => {
            if (fresh) {
              setUser(fresh);
            }
          }).catch((err) => {
            console.warn('Could not sync fresh profile from cloud:', err);
          });
        }
      }
    } catch (e) {
      console.error('Error loading auth from storage:', e);
    }
    setIsHydrated(true);
  }, []);

  const loginWithProfile = (profile: {
    name: string;
    contact: string;
    email?: string;
    city?: string;
    avatar?: string;
    provider?: 'google' | 'telegram' | 'direct' | 'guest';
    telegramUsername?: string;
  }) => {
    const cleanName = profile.name.trim();
    const cleanContact = profile.contact.trim();
    const cleanEmail = profile.email ? profile.email.trim() : undefined;
    const cleanTg = profile.telegramUsername
      ? profile.telegramUsername.trim().replace(/^@/, '')
      : cleanContact.startsWith('@')
      ? cleanContact.replace(/^@/, '')
      : undefined;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      contact: cleanContact,
      email: cleanEmail,
      city: profile.city?.trim() || 'Toshkent',
      avatar:
        profile.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=141413,27272a,3f3f46`,
      provider: profile.provider || 'direct',
      telegramUsername: cleanTg,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    profilesService.upsertProfile(newUser).catch((err) => {
      console.warn('Could not sync user profile to cloud:', err);
    });
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        ...updates,
        name: updates.name ? updates.name.trim() : prev.name,
        contact: updates.contact ? updates.contact.trim() : prev.contact,
        city: updates.city ? updates.city.trim() : prev.city,
      };
      if (updates.name && !updates.avatar) {
        updated.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(updated.name)}&backgroundColor=141413,27272a,3f3f46`;
      }
      
      // Save locally and to Supabase
      profilesService.upsertProfile(updated).catch((err) => {
        console.warn('Could not update profile on cloud:', err);
      });

      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
        localStorage.setItem('bookswap_user', JSON.stringify(updated));

        // Sync ownerFavoriteGenres, ownerWishlist, ownerName, ownerContact to user's books in storage & cloud
        const syncBooks = (key: string) => {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const books = JSON.parse(raw);
              if (Array.isArray(books)) {
                let changed = false;
                const newBooks = books.map((b: Book) => {
                  if (b.ownerId === updated.id) {
                    changed = true;
                    // Trigger cloud book update
                    booksService.updateBook(b.id, {
                      ownerName: updated.name,
                      ownerContact: updated.contact,
                      ownerFavoriteGenres: updated.favoriteGenres,
                      ownerWishlist: updated.wishlistBooks,
                    }).catch(() => {});

                    return {
                      ...b,
                      ownerName: updated.name,
                      ownerContact: updated.contact,
                      ownerFavoriteGenres: updated.favoriteGenres,
                      ownerWishlist: updated.wishlistBooks,
                    };
                  }
                  return b;
                });
                if (changed) {
                  localStorage.setItem(key, JSON.stringify(newBooks));
                }
              }
            } catch {
              // ignore
            }
          }
        };
        syncBooks('kitto_books');
        syncBooks('bookswap_books');
      } catch (e) {
        console.error('Failed to update user profile in localStorage:', e);
      }
      return updated;
    });
  };

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    const name = customName?.trim() || 'Foydalanuvchi';
    const email = customEmail?.trim() || '';

    loginWithProfile({
      name,
      contact: email || '+998 90 123 45 67',
      email,
      provider: 'google',
    });
  };

  const loginWithTelegram = (customUsername?: string, customName?: string) => {
    let username = customUsername ? customUsername.replace(/^@/, '') : '';
    let name = customName || '';
    let photoUrl = '';

    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tg = window.Telegram.WebApp.initDataUnsafe.user;
      if (!username && tg.username) username = tg.username;
      if (!name) name = `${tg.first_name || ''} ${tg.last_name || ''}`.trim() || `@${username}`;
      if (tg.photo_url) photoUrl = tg.photo_url;
    }

    if (!name) name = username ? `@${username}` : 'Kitobxon';
    const contact = username ? `@${username}` : '+998 90 000 00 00';

    loginWithProfile({
      name,
      contact,
      telegramUsername: username || undefined,
      avatar: photoUrl || undefined,
      provider: 'telegram',
    });
  };

  const loginAsGuest = (name: string, contact?: string, email?: string) => {
    const cleanName = name.trim() || 'Mehmon kitobxon';
    const cleanContact = contact?.trim() || '+998 90 123 45 67';

    loginWithProfile({
      name: cleanName,
      contact: cleanContact,
      email: email?.trim(),
      provider: 'guest',
    });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem('bookswap_user');
    } catch (e) {
      console.error('Failed to clear user from storage:', e);
    }
  };

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isHydrated && !!user,
        loginWithProfile,
        updateProfile,
        loginWithGoogle,
        loginWithTelegram,
        loginAsGuest,
        logout,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
