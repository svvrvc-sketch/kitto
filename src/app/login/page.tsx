'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogoIcon } from '@/components/Logo';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/cabinet';

  const { isAuthenticated, user, loginWithGoogle, loginWithProfile } = useAuth();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneName, setPhoneName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

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

  const handleDirectPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = phoneName.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanName) {
      setError('Iltimos, ismingizni kiriting');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('Iltimos, toʻgʻri telefon raqamingizni kiriting (+998...)');
      return;
    }

    try {
      await loginWithProfile({
        name: cleanName,
        contact: cleanPhone,
        city: 'Toshkent shahri',
        provider: 'direct',
      });
      router.replace(redirectTarget);
    } catch {
      setError('Kirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl shadow-editorial p-7 sm:p-9 text-center space-y-6">
        {/* Logo & Headline */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="p-2 rounded-2xl bg-amber-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <LogoIcon size={32} />
            </div>
            <span className="font-sans text-2xl font-bold tracking-tight">Kitto.</span>
          </Link>
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Tizimga kirish
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Kitob almashish tarmogʻiga xush kelibsiz
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs text-left border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Primary Action: Google OAuth Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full py-3.5 px-5 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-750 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loadingGoogle ? (
              <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Google orqali davom etish</span>
          </button>

          {/* Quick Direct Phone fallback toggle */}
          {!showPhoneLogin ? (
            <button
              type="button"
              onClick={() => setShowPhoneLogin(true)}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline transition-colors"
            >
              yoki telefon raqam orqali kirish
            </button>
          ) : (
            <form onSubmit={handleDirectPhoneLogin} className="space-y-3 pt-3 text-left border-t border-stone-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Ism va familiya
                </label>
                <input
                  type="text"
                  required
                  value={phoneName}
                  onChange={(e) => setPhoneName(e.target.value)}
                  placeholder="Ali Valiyev"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Telefon raqam (+998...)
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPhoneLogin(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#141413] hover:bg-black text-white text-xs font-semibold shadow-xs"
                >
                  Kirish
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 15-Day Inactivity Security Info Box */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-left space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>15 kunlik xavfsiz sessiya</span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-zinc-400 leading-relaxed">
            Xavfsizlik yuzasidan, agar siz 15 kun davomida saytga kirmasangiz, hisobingizdan avtomatik ravishda chiqiladi.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Kitoblaringiz va barcha maʼlumotlaringiz abadiy saqlanadi</span>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 flex items-center justify-center">
          <div className="animate-pulse font-sans text-lg text-stone-600">Kirish oynasi yuklanmoqda...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
