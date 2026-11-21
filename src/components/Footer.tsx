'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { ShieldCheck, Heart, Send, BookOpen, Compass, HelpCircle, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 pt-8 pb-20 sm:py-12 text-xs text-stone-600 dark:text-stone-400 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile View: Ultra-Compact & Minimalist (No endless scrolling) */}
        <div className="md:hidden space-y-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-block">
              <Logo showTagline={false} size={24} />
            </Link>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Bepul almashuv</span>
            </div>
          </div>

          {/* Compact 2-Column Links Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium py-2 border-y border-stone-200/70 dark:border-stone-800">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Platforma
              </span>
              <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                <li>
                  <Link href="/catalog" className="hover:text-amber-600 transition-colors">
                    Kitoblar katalogi
                  </Link>
                </li>
                <li>
                  <Link href="/add-book" className="hover:text-amber-600 transition-colors">
                    + Kitob joylash
                  </Link>
                </li>
                <li>
                  <Link href="/cabinet" className="hover:text-amber-600 transition-colors">
                    Shaxsiy kabinet
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Yo&#39;riqnoma
              </span>
              <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                <li>
                  <Link href="/how-it-works" className="hover:text-amber-600 transition-colors">
                    Qanday ishlaydi?
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-amber-600 transition-colors">
                    Xavfsizlik qoidalari
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-amber-600 transition-colors">
                    Ko&#39;p savollar (FAQ)
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Bottom Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-stone-500">
              &copy; {new Date().getFullYear()} Kitto.uz
            </span>
            <a
              href="https://t.me/kitto_admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95 shrink-0"
            >
              <Send className="w-3 h-3" />
              <span>Telegram yordam</span>
            </a>
          </div>
        </div>

        {/* Desktop View: Full 4-Column Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-10">
          {/* 1. Brand & Info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <Logo showTagline={true} />
            </Link>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pt-1">
              O‘zbekiston bo‘ylab kitobxonlar o‘rtasida o‘zaro ishonch asosidagi kitob almashish va mutolaa platformasi.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Respublika bo‘ylab 100% bepul faoliyat</span>
            </div>
          </div>

          {/* 2. Platforma Sahifalari */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 dark:text-stone-100 mb-3.5">
              Platforma
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/catalog" className="hover:text-amber-600 transition-colors">
                  Kitoblar katalogi (Do‘kon)
                </Link>
              </li>
              <li>
                <Link href="/add-book" className="hover:text-amber-600 transition-colors">
                  + Kitob e’lon qilish
                </Link>
              </li>
              <li>
                <Link href="/cabinet" className="hover:text-amber-600 transition-colors">
                  Shaxsiy kabinet
                </Link>
              </li>
              <li>
                <Link href="/messages" className="hover:text-amber-600 transition-colors">
                  Suhbatlar va xabarlar
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Qo'llanma & Qoidalar */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 dark:text-stone-100 mb-3.5">
              Yo‘riqnoma & Yordam
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/how-it-works" className="hover:text-amber-600 transition-colors">
                  Qanday ishlaydi? (4 qadam)
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-amber-600 transition-colors">
                  Xavfsizlik & Asrash qoidalari
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-600 transition-colors">
                  Ko‘p beriladigan savollar
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-600 transition-colors">
                  Biz haqimizda & Missiya
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Bog'lanish & Telegram */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 dark:text-stone-100 mb-3.5">
              Hamjamiyat & Aloqa
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
              Savollaringiz yoki takliflaringiz bo‘lsa, Telegram orqali operatorlarimizga yozing.
            </p>
            <a
              href="https://t.me/kitto_admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegramda bog‘lanish</span>
            </a>
          </div>
        </div>

        {/* Desktop Bottom bar */}
        <div className="hidden md:flex pt-6 border-t border-stone-200/60 dark:border-stone-800 items-center justify-between gap-3 text-[11px] text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} Kitto.uz — Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="hover:underline">
              Qo‘llanma
            </Link>
            <Link href="/safety" className="hover:underline">
              Xavfsizlik
            </Link>
            <Link href="/faq" className="hover:underline">
              FAQ
            </Link>
            <Link href="/about" className="hover:underline">
              Biz haqimizda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
