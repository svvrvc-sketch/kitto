'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Kitto ErrorBoundary Caught Exception]:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 stroke-[2]" />
        </div>

        <h2 className="font-serif font-bold text-xl sm:text-2xl">
          Kutilmagan xatolik yuz berdi
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
          Ilova keshini yangilash yoki sahifani qayta yuklash orqali muammoni darhol hal qilishingiz mumkin.
        </p>

        {error?.message && (
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-zinc-800 text-[11px] text-stone-600 dark:text-zinc-400 font-mono text-left break-all max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-[#141413] hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Qayta urinish</span>
          </button>

          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Keshni tozalash</span>
          </button>
        </div>
      </div>
    </div>
  );
}
