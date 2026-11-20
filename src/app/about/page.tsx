'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Heart, Users, Globe2, Sparkles, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Asosiy sahifaga qaytish</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="w-16 h-16 rounded-3xl overflow-hidden border border-amber-500/30 mx-auto mb-4 shadow-sm bg-[#141412]">
            <img src="/kittologo.jpg" alt="Kitto" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Kitto — Toshkent Kitobxonlari Hamjamiyati
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
            Biz kitoblarning tokchalarda chang bosib yotishiga emas, balki qo‘ldan-qo‘lga o‘tib, insonlar tafakkurini boyitishiga ishonamiz.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3 text-stone-900 dark:text-stone-100">
            Bizning Missiyamiz
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
            O‘zbekistonda mutolaa madaniyatini yangi bosqichga olib chiqish, har bir inson uchun qimmatbaho kitoblardan tekin foydalanish imkoniyatini yaratish va shahar bo‘ylab kitobsevarlar o‘rtasida mustahkam do‘stlik rishtalarini bog‘lashdir.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-100 dark:border-stone-800">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">100%</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Bepul va xolis xizmat
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">12 ta</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Toshkent tumanlari qamrovi
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">0 so‘m</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Komissiya yoki to‘lovlar
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h3 className="text-xl font-extrabold text-center mb-8">
            Asosiy Qadriyatlarimiz
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-1">
                O‘zaro Ishonch
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Kitto a’zolari bir-biriga o‘z kitoblarini ishonadi va qadrlaydi. QR-kodli kafolat tizimi esa bu ishonchni mustahkamlaydi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-1">
                Ekologik Foyda
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Bitta kitob 10 lab odam qo‘lidan o‘tishi minglab daraxtlarni saqlab qoladi va qog‘oz isrofini kamaytiradi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-1">
                Jonli Muloqot
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Kitob almashish shunchaki bitim emas — u yangi fikrdoshlar va ma’rifatli do‘stlar topish vositasidir.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
