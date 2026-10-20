'use client';

import React, { useEffect } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Kitto Notice]:', error);

    // Silent Auto-Recovery: if an unexpected client crash happens,
    // automatically heal local state and reload once without bothering the user
    try {
      const hasAutoRetried = sessionStorage.getItem('kitto_auto_retried');
      if (!hasAutoRetried) {
        sessionStorage.setItem('kitto_auto_retried', 'true');
        // Clean out potentially corrupt data keys
        localStorage.removeItem('kitto_books');
        localStorage.removeItem('kitto_chats');
        localStorage.removeItem('bookswap_books');
        localStorage.removeItem('bookswap_chats');
        window.location.reload();
      }
    } catch {
      // ignore
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-editorial text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7 stroke-[1.8]" />
        </div>

        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
            Sahifa yangilanmoqda
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Kitoblar katalogini koʻrish uchun bosh sahifaga oʻting
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            onClick={() => reset()}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Bosh sahifaga oʻtish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
