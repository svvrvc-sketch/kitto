/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthContextType } from '@/types/auth';
import { Book } from '@/types/book';
import { profilesService, booksService, STORAGE_USER_KEY } from '@/services/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUzbekPhone, formatUzbekPhone } from '@/utils/phone';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [isPhonePromptOpen, setIsPhonePromptOpen] = useState(false);
  const [phonePromptReason, setPhonePromptReason] = useState<string | null>(null);

  const clearUserStorage = () => {
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem('bookswap_user');
      // Clear cookie used for middleware RBAC if present
      document.cookie = 'kitto_user_id=; path=/; max-age=0';
      document.cookie = 'kitto_user_role=; path=/; max-age=0';
    } catch {
      // ignore
    }
  };

  const persistUserStorage = (u: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
      localStorage.setItem('bookswap_user', JSON.stringify(u));
      // Set secure cookie for middleware check
      document.cookie = `kitto_user_id=${encodeURIComponent(u.id)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `kitto_user_role=${encodeURIComponent(u.role || 'user')}; path=/; max-age=2592000; SameSite=Lax`;
    } catch (e) {
      console.warn('Storage save notice:', e);
    }
  };

  const syncSupabaseUser = useCallback(async (authUser: { id: string; email?: string; phone?: string; user_metadata?: Record<string, any> }) => {
    try {
      const existing = await profilesService.getProfile(authUser.id);
      const fullName =
        existing?.name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Kitobxon';
      const avatarUrl =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        existing?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=141413,27272a,3f3f46`;

      // Clean contact: NEVER set email as phone number!
      let contactVal = '';
      if (existing?.contact && !existing.contact.includes('@') && isValidUzbekPhone(existing.contact)) {
        contactVal = existing.contact;
      } else if (authUser.phone && isValidUzbekPhone(authUser.phone)) {
        contactVal = authUser.phone;
      }

      const resolvedProfile: UserProfile = {
        id: authUser.id,
        name: fullName,
        contact: contactVal,
        email: authUser.email || existing?.email,
        city: existing?.city || 'Toshkent',
        favoriteGenres: existing?.favoriteGenres || [],
        wishlistBooks: existing?.wishlistBooks || [],
        avatar: avatarUrl,
        avatar_url: avatarUrl,
        role: existing?.role || 'user',
        provider: 'google',
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      setUser(resolvedProfile);
      persistUserStorage(resolvedProfile);

      // Clean OAuth ?code= from browser URL bar
      if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // If user has no valid phone after Google OAuth, automatically prompt them!
      if (!contactVal || !isValidUzbekPhone(contactVal)) {
        setIsPhonePromptOpen(true);
        setPhonePromptReason('Google orqali kirdingiz. Kitob almashish va eʼlon berish uchun telefon raqamingizni kiritish majburiy.');
      }

      // Async upsert to ensure cloud profile is up to date
      profilesService.upsertProfile(resolvedProfile).catch(() => {});
    } catch (e) {
      console.error('Error syncing Supabase user:', e);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY) || localStorage.getItem('bookswap_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
          // If stored contact was mistakenly saved as email, clear it!
          if (parsed.contact && parsed.contact.includes('@')) {
            parsed.contact = '';
          }
          setUser(parsed);
          // Sync fresh profile from cloud
          profilesService.getProfile(parsed.id).then((fresh) => {
            if (fresh) {
              if (fresh.contact && fresh.contact.includes('@')) {
                fresh.contact = '';
              }
              setUser(fresh);
              persistUserStorage(fresh);
            }
          }).catch(() => {});
        }
      }
    } catch {
      // zero fake auto-login
    }
  }, []);

  // SSR mount guard and Supabase Auth session listener
  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          syncSupabaseUser(session.user);
        } else {
          loadFromLocalStorage();
        }
        setIsHydrated(true);
      }).catch(() => {
        if (isMounted) {
          loadFromLocalStorage();
          setIsHydrated(true);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            syncSupabaseUser(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            clearUserStorage();
          }
        }
      );

      return () => {
        isMounted = false;
        authListener?.subscription?.unsubscribe();
      };
    } else {
      loadFromLocalStorage();
      setIsHydrated(true);
    }
  }, [syncSupabaseUser, loadFromLocalStorage]);

  const loginWithProfile = (profile: {
    name: string;
    contact: string;
    email?: string;
    city?: string;
    avatar?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
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

    const avatarUrl =
      profile.avatar ||
      profile.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=141413,27272a,3f3f46`;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      contact: cleanContact,
      email: cleanEmail,
      city: profile.city?.trim() || 'Toshkent',
      avatar: avatarUrl,
      avatar_url: avatarUrl,
      role: profile.role || 'user',
      provider: profile.provider || 'direct',
      telegramUsername: cleanTg,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    persistUserStorage(newUser);

    profilesService.upsertProfile(newUser).catch((err) => {
      console.warn('Could not sync user profile to cloud:', err);
    });
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const avatarVal = updates.avatar || updates.avatar_url || prev.avatar;
      const updated: UserProfile = {
        ...prev,
        ...updates,
        avatar: avatarVal,
        avatar_url: avatarVal,
        name: updates.name ? updates.name.trim() : prev.name,
        contact: updates.contact ? updates.contact.trim() : prev.contact,
        city: updates.city ? updates.city.trim() : prev.city,
      };

      if (updates.name && !updates.avatar && !updates.avatar_url) {
        const generated = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(updated.name)}&backgroundColor=141413,27272a,3f3f46`;
        updated.avatar = generated;
        updated.avatar_url = generated;
      }

      profilesService.upsertProfile(updated).catch((err) => {
        console.warn('Could not update profile on cloud:', err);
      });

      persistUserStorage(updated);

      // Sync user's books in storage & cloud
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

      return updated;
    });
  };

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    if (isSupabaseConfigured && typeof window !== 'undefined') {
      try {
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) {
          console.warn('Supabase signInWithOAuth error, using direct profile:', error.message);
        } else {
          // Browser is redirecting to Google OAuth
          return;
        }
      } catch (e) {
        console.warn('Google OAuth initiation failed:', e);
      }
    }

    // Direct fallback if offline/mock
    const name = customName?.trim() || 'Google Foydalanuvchisi';
    const email = customEmail?.trim() || 'user@gmail.com';
    loginWithProfile({
      name,
      contact: '',
      email,
      provider: 'google',
    });
    setIsPhonePromptOpen(true);
    setPhonePromptReason('Google orqali kirdingiz. Kitob almashish va eʼlon berish uchun telefon raqamingizni kiritish majburiy.');
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
    const contact = username ? `@${username}` : '';

    loginWithProfile({
      name,
      contact,
      telegramUsername: username || undefined,
      avatar: photoUrl || undefined,
      avatar_url: photoUrl || undefined,
      provider: 'telegram',
    });

    if (!contact || !isValidUzbekPhone(contact)) {
      setIsPhonePromptOpen(true);
      setPhonePromptReason('Kitob almashish va eʼlon berish uchun telefon raqamingizni kiriting.');
    }
  };

  const loginAsGuest = (name: string, contact?: string, email?: string) => {
    const cleanName = name.trim() || 'Mehmon kitobxon';
    const cleanContact = contact && isValidUzbekPhone(contact) ? formatUzbekPhone(contact) : '';

    loginWithProfile({
      name: cleanName,
      contact: cleanContact,
      email: email?.trim(),
      provider: 'guest',
    });
  };

  const logout = async () => {
    setUser(null);
    clearUserStorage();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
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

  const hasValidPhone = Boolean(user && isValidUzbekPhone(user.contact));

  const openPhonePrompt = useCallback((reason?: string) => {
    setPhonePromptReason(reason || null);
    setIsPhonePromptOpen(true);
  }, []);

  const closePhonePrompt = useCallback(() => {
    setIsPhonePromptOpen(false);
    setPhonePromptReason(null);
  }, []);

  const savePhoneNumber = useCallback(async (phone: string) => {
    const formatted = formatUzbekPhone(phone);
    if (!isValidUzbekPhone(formatted)) {
      throw new Error('Iltimos, toʻgʻri Oʻzbekiston telefon raqamini kiriting (+998...)');
    }
    updateProfile({ contact: formatted });
    setIsPhonePromptOpen(false);
    setPhonePromptReason(null);
  }, [updateProfile]);

  // Prompt for phone if user is authenticated but has no valid phone (e.g. from Google login)
  useEffect(() => {
    if (isHydrated && user && (!user.contact || !isValidUzbekPhone(user.contact))) {
      setIsPhonePromptOpen(true);
      setPhonePromptReason('Kitto platformasida kitob almashish va eʼlon berish uchun telefon raqam kiritish majburiy.');
    }
  }, [isHydrated, user]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isHydrated && !!user,
        isAdmin,
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
        hasValidPhone,
        isPhonePromptOpen,
        phonePromptReason,
        openPhonePrompt,
        closePhonePrompt,
        savePhoneNumber,
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
