'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { ShieldCheck, UserCheck, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const { isAuthenticated, user, loginWithGoogle, loginWithTelegram, loginWithProfile } = useAuth();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, user, redirectTarget, router]);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch {
      setError('Google orqali kirishda xatolik yuz berdi. Iltimos, qayta urinib koʻring.');
      setLoadingGoogle(false);
    }
  };

  const handleTelegramLogin = () => {
    setLoadingTelegram(true);
    loginWithTelegram();
    setLoadingTelegram(false);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanContact = contact.trim();

    if (!cleanName) {
      setError('Iltimos, ism va familiyangizni kiriting');
      return;
    }
    if (!cleanContact) {
      setError('Iltimos, telefon raqamingiz yoki Telegram username kiriting');
      return;
    }

    loginWithProfile({
      name: cleanName,
      contact: cleanContact,
      email: email.trim() || undefined,
      provider: 'direct',
    });

    router.replace(redirectTarget);
  };

  return (
    <div className="w-full max-w-md">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Asosiy sahifaga qaytish</span>
      </Link>

      {/* Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-7 sm:p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo showTagline={false} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Tizimga kirish
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1.5">
            Kitoblarni boshqarish va kitobxonlar bilan bogʻlanish uchun kiring
          </p>
        </div>

        {/* Quick OAuth options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            id="login-page-google-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-100 font-medium text-xs border border-stone-200/90 dark:border-zinc-700 shadow-sm transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loadingGoogle ? 'Ulanmoqda...' : 'Google orqali'}</span>
          </button>

          <button
            id="login-page-telegram-btn"
            type="button"
            onClick={handleTelegramLogin}
            disabled={loadingTelegram}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-100 font-medium text-xs border border-stone-200/90 dark:border-zinc-700 shadow-sm transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5 text-sky-600 fill-current shrink-0" />
            <span>{loadingTelegram ? 'Ulanmoqda...' : 'Telegram orqali'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-white dark:bg-zinc-900 px-3 text-stone-400 dark:text-zinc-500">
              yoki maʼlumotlar bilan
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleDirectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Ism va familiya *
            </label>
            <input
              id="login-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="masalan: Aziz Rahimov"
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Telefon raqam yoki Telegram *
            </label>
            <input
              id="login-contact-input"
              type="text"
              required
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (error) setError('');
              }}
              placeholder="+998 90 123 45 67 yoki @username"
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Email manzil (ixtiyoriy)
            </label>
            <input
              id="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aziz@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-sm tracking-wide shadow-tactile transition-all active:scale-[0.99] mt-2"
          >
            <UserCheck className="w-4 h-4 stroke-[2.2]" />
            <span>Davom etish</span>
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Xavfsiz va shifrlangan maʼlumotlar muhiti</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100 transition-colors">
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-stone-400 font-medium">
            Yuklanmoqda...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
