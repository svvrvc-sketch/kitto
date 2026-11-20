'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export const HeroExchangeShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-md mx-auto select-none py-4 sm:py-6 ${className}`}>
      {/* Warm ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-orange-400/10 to-emerald-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Fan-Out of 3 Realistic Books from Uzbek Literature */}
      <div className="relative h-60 sm:h-72 flex items-center justify-center">
        {/* Book 1 (Left - Tilted) */}
        <div className="absolute left-2 sm:left-4 top-4 sm:top-6 w-36 sm:w-44 h-48 sm:h-56 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 border border-emerald-500/40 shadow-xl p-3.5 text-white -rotate-12 transition-transform duration-300 hover:rotate-0 hover:z-20 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">Doimiy</span>
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h4 className="font-sans font-black text-xs sm:text-sm leading-tight mt-4">O&#39;tkan kunlar</h4>
          <p className="text-[10px] text-stone-300 mt-1">Abdulla Qodiriy</p>
          <div className="mt-6 pt-2 border-t border-emerald-800/80 flex items-center gap-1.5 text-[9px] text-stone-400">
            <MapPin className="w-2.5 h-2.5 text-amber-400" />
            <span>Chilonzor metrosi</span>
          </div>
        </div>

        {/* Book 3 (Right - Tilted) */}
        <div className="absolute right-2 sm:right-4 top-4 sm:top-6 w-36 sm:w-44 h-48 sm:h-56 rounded-2xl bg-gradient-to-br from-sky-950 via-stone-900 to-stone-950 border border-sky-500/40 shadow-xl p-3.5 text-white rotate-12 transition-transform duration-300 hover:rotate-0 hover:z-20 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-between text-[10px] text-sky-300 font-bold mb-2">
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30">Hadya</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h4 className="font-sans font-black text-xs sm:text-sm leading-tight mt-4">Sariq devni minib</h4>
          <p className="text-[10px] text-stone-300 mt-1">X. To&#39;xtaboyev</p>
          <div className="mt-6 pt-2 border-t border-sky-800/80 flex items-center gap-1.5 text-[9px] text-stone-400">
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            <span>Paxtakor metrosi</span>
          </div>
        </div>

        {/* Book 2 (Center - Prominent Front) */}
        <div className="relative z-10 w-40 sm:w-48 h-56 sm:h-64 rounded-2xl bg-gradient-to-br from-amber-950 via-stone-900 to-zinc-950 border-2 border-amber-500/60 shadow-2xl p-4 sm:p-5 text-white transition-transform duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold mb-3">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40">Vaqtincha</span>
            <span className="text-[9px] text-amber-400 font-extrabold uppercase">14 kunga</span>
          </div>
          <h4 className="font-sans font-black text-sm sm:text-base leading-tight mt-6">Dunyoning ishlari</h4>
          <p className="text-[11px] text-amber-200/90 mt-1">O&#39;tkir Hoshimov</p>
          <div className="mt-8 pt-3 border-t border-amber-800/80 flex items-center justify-between text-[10px] text-stone-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Oybek metrosi</span>
            </div>
            <span className="text-emerald-400 font-bold">A&#39;lo holat</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Trust Pill */}
      <div className="mt-3 sm:mt-5 text-center">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-stone-900/95 border border-amber-500/30 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-md hover:border-amber-500 transition-all group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Toshkentda 1,200+ ta kitob kutmoqda</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
