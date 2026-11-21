'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

export const HeroExchangeShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-md mx-auto select-none ${className}`}>
      {/* Warm ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-emerald-500/10 blur-3xl rounded-3xl pointer-events-none -z-10" />

      {/* Modern Matte Dark Card inspired by reference UI */}
      <div className="relative rounded-3xl bg-[#121413] border border-zinc-800/80 p-5 sm:p-7 shadow-2xl text-white overflow-hidden">
        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>100% Xolis Hamjamiyat</span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>O‘zbekiston</span>
          </span>
        </div>

        {/* Card Title & Description */}
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
          Kitoblarga erkinlik bering — javoningizdagi durdonalarni ulashing
        </h3>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          O‘qilgan kitob tokchada chang bosmasin. Boshqa kitobxonlar bilan to‘g‘ridan-to‘g‘ri, xavfsiz va mutlaqo bepul almashing.
        </p>

        {/* Clean Spec Badges */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-center">
            <div className="text-base sm:text-lg font-black text-amber-400">0 so‘m</div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Xarajat yo‘q</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-center">
            <div className="text-base sm:text-lg font-black text-emerald-400">P2P</div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Xolis almashuv</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-center">
            <div className="text-base sm:text-lg font-black text-amber-300">14 ta</div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Barcha hudud</div>
          </div>
        </div>

        {/* Feature Points */}
        <div className="space-y-2 mb-6 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span>Tasdiqlangan kitobxonlar bilan ishonchli aloqa</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-3 h-3" />
            </div>
            <span>Doimiy almashish yoki vaqtincha mutolaa</span>
          </div>
        </div>

        {/* CTA link */}
        <Link
          href="/catalog"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Katalogni ochish</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
