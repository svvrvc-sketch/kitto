'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  ShieldCheck,
  QrCode,
  MapPin,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Check,
  Star,
  Users,
} from 'lucide-react';

export const HeroExchangeShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className={`w-full max-w-[500px] mx-auto select-none ${className}`}>
      {/* Outer Glow Wrapper */}
      <div className="relative group">
        {/* Ambient Gradient Backing */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-emerald-600/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        {/* Main Glassmorphic Obsidian Card */}
        <div className="relative bg-[#151311] dark:bg-[#12100E] border border-amber-500/25 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl overflow-hidden text-stone-100">
          {/* Subtle Decorative Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* 1. Header Bar: Real-time Status */}
          <div className="relative z-10 flex items-center justify-between gap-2 pb-4 mb-4 border-b border-stone-800/90">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Jonli almashuv Toshkentda</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>100% Xolis</span>
            </div>
          </div>

          {/* 2. Visual Two-Book P2P Exchange Stage */}
          <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3 py-2">
            {/* Book 1 (Left - Sardor) */}
            <div className="flex-1 max-w-[170px] bg-gradient-to-br from-emerald-950/90 via-stone-900 to-stone-950 border border-emerald-500/35 rounded-2xl p-3 sm:p-4 shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group/book1">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-amber-500/50 rounded-full" />
              <div className="pl-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-wider border border-emerald-500/30">
                    A&#39;lo
                  </span>
                  <BookOpen className="w-3.5 h-3.5 text-amber-400/80" />
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-stone-100 line-clamp-1 leading-snug">
                  O&#39;tkan kunlar
                </h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400 line-clamp-1">
                  Abdulla Qodiriy
                </p>

                {/* Owner Tag */}
                <div className="mt-4 pt-2.5 border-t border-stone-800/80 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-stone-300 truncate">Sardor H.</p>
                    <p className="text-[9px] text-stone-500 truncate">Chilonzor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Dynamic Exchange Node */}
            <div className="flex flex-col items-center justify-center shrink-0 px-1 relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300/40 animate-pulse">
                <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              </div>
              <span className="mt-1.5 text-[9px] font-extrabold text-amber-400 uppercase tracking-wider text-center">
                0 so&#39;m
              </span>
              <span className="text-[8px] text-stone-400">bepul</span>
            </div>

            {/* Book 2 (Right - Malika) */}
            <div className="flex-1 max-w-[170px] bg-gradient-to-br from-amber-950/90 via-stone-900 to-stone-950 border border-amber-500/35 rounded-2xl p-3 sm:p-4 shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group/book2">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-amber-500/50 rounded-full" />
              <div className="pl-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[9px] uppercase tracking-wider border border-amber-500/30">
                    Yangi
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-stone-100 line-clamp-1 leading-snug">
                  Dunyoning ishlari
                </h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400 line-clamp-1">
                  O&#39;tkir Hoshimov
                </p>

                {/* Owner Tag */}
                <div className="mt-4 pt-2.5 border-t border-stone-800/80 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    M
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-stone-300 truncate">Malika U.</p>
                    <p className="text-[9px] text-stone-500 truncate">Oybek</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Live Handover Location & QR Verification Stamp */}
          <div className="relative z-10 mt-5 p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-stone-200">
                  Uchrashuv: Oybek metro bekati
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                Bugun 18:30
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
              <div className="flex items-center gap-2 text-stone-400">
                <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-stone-300">Shaxsiy QR-kod orqali tasdiqlangan</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kafolatlangan</span>
              </div>
            </div>
          </div>

          {/* 4. Three Steps Interactive Tabs (Qadamlar) */}
          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Tanlang', desc: 'Katalogdan kitob' },
              { num: 2, title: 'Yozishing', desc: 'Chatda kelishing' },
              { num: 3, title: 'Oling', desc: 'Metroda alishing' },
            ].map((step) => {
              const isActive = activeStep === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(step.num)}
                  className={`p-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'bg-stone-900/60 border border-stone-800/80 text-stone-400 hover:text-stone-300 hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                        isActive
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {step.num}
                    </span>
                    <span className="text-[11px] font-bold truncate">{step.title}</span>
                  </div>
                  <p className="text-[9px] text-stone-400 mt-0.5 truncate">{step.desc}</p>
                </button>
              );
            })}
          </div>

          {/* 5. Bottom Quick Link to Catalog */}
          <div className="relative z-10 mt-4 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>1,200+ ta tayyor kitobni ko&#39;rish</span>
              <span className="text-amber-500">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
