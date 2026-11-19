'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, MessageSquare, QrCode, Repeat, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Kitobingizni javonga joylang',
      desc: 'O‘qib bo‘lgan yoki javoningizda turgan kitobni suratga olib, nomini, holatini va Toshkentdagi uchrashuv hududini (tuman/metro) belgilang. E’lon berish 1 daqiqa vaqt oladi va butunlay bepul.',
      icon: BookOpen,
      badge: '1 daqiqada',
    },
    {
      num: '02',
      title: 'Kitobxonlar bilan kelishing',
      desc: 'Sayt ichidagi qulay xabarlar orqali boshqa kitobxon bilan bog‘laning. Qaysi kitobga almashtirish, vaqtincha mutolaa qilish muddati yoki hadya shartlarini xaritada aniqlang.',
      icon: MessageSquare,
      badge: 'Xavfsiz chat',
    },
    {
      num: '03',
      title: 'Uchrashing va QR-kod orqali tasdiqlang',
      desc: 'Belgilangan jamoat joyida (metro, qahvaxona yoki xiyobonda) ko‘rishib, kitobni oling. Tomonlar shaxsiy QR-kodni skanerlab almashuvni rasmiylashtiradi — bu orqali hech bir kitob yo‘qolmaydi.',
      icon: QrCode,
      badge: 'QR Kafolat',
    },
    {
      num: '04',
      title: 'Mutolaa qiling va yangi ufqlarni oching',
      desc: 'Belgilangan muddatda kitobni toza va asrab o‘qib, egasiga qaytaring yoki doimiy almashuv orqali javoningizni doim yangilab boring. Har bir muvaffaqiyatli almashuv reytingingizni oshiradi.',
      icon: Repeat,
      badge: 'Obro‘ & Reyting',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
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

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Oddiy, tez va bepul</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 mb-4">
            Kitto qanday ishlaydi?
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
            Kitto — Toshkent bo‘ylab kitobxonlarni birlashtiruvchi zamonaviy P2P kitob almashish platformasi. Kitoblaringiz tokchada chang bosib yotmasin, boshqalar bilan baham ko‘ring!
          </p>
        </div>

        {/* 4 Interactive Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-extrabold text-2xl sm:text-3xl text-amber-600/30 group-hover:text-amber-600 transition-colors">
                      {step.num}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-xs">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
              Kitto orqali almashishning afzalliklari
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>0 so‘m xarajat:</strong> Kitob xarid qilmasdan yuzlab yangi asarlarni mutolaa qiling.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Toshkent xaritasi:</strong> O‘zingizga eng yaqin tuman yoki metro bekatidan toping.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Madaniyatli hamjamiyat:</strong> Haqiqiy kitobsevarlar bilan do‘stlashib, suhbat quring.</span>
            </div>
          </div>
        </div>

        {/* Action Call */}
        <div className="text-center py-6">
          <Link
            href="/add-book"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all"
          >
            <span>Birinchi kitobingizni joylang</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
