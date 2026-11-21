'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, MapPin, PhoneCall, UserCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Do&#39;konga qaytish</span>
          </Link>
          <Link
            href="/cabinet?tab=safety"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <span>Kabinet ichida ko‘rish &rarr;</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Shield className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Xavfsizlik va Maxfiylik Qoidalari
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Kitto — o‘zaro ishonch, xavfsizlik va shaxsiy maʼlumotlar daxlsizligiga qatʼiy tayanadi. Har bir aʼzomiz quyidagi asosiy tamoyillarga rioya qiladi.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="space-y-6 mb-12">
          {/* Rule 1: Uchrashuv joylari */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
                1. Uchrashuvlarni gavjum va xavfsiz joylarda o‘tkazing
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Shahar markazlari, ommaviy kutubxonalar, yorug‘ qahvaxonalar, metro bekatlari yoki savdo markazlari uchrashuv uchun eng ideal va xavfsiz maskanlardir. Noma’lum yoki chekka manzillarga bormang.
              </p>
            </div>
          </div>

          {/* Rule 2: Kitobni asrab-avaylash */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
                2. Kitobni o‘z mulkingizdek asrab o‘qing
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Vaqtincha olingan kitob sahifalariga qalam yoki ruchka bilan chizmang, burchaklarini buklamang (xatcho‘pdan foydalaning) va ovqatlanish vaqtida ochmang. Kitobni qanday olgan bo‘lsangiz, shunday toza holda qaytaring.
              </p>
            </div>
          </div>

          {/* Rule 3: Chatda topshirishni tasdiqlash */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
                3. Suhbatda topshirishni tasdiqlang
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Kitobni qo‘lga olganingizda, suhbat oynasidagi &apos;Topshirildi deb yakunlash&apos; tugmasi orqali almashuvni tasdiqlang. Bu tizimda almashuv boshlanganini rasmiylashtiradi va qaytarish muddatini xolisona nazorat qiladi.
              </p>
            </div>
          </div>

          {/* Rule 4: Haqiqiy profil va telefon */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
                4. Tasdiqlangan telefon raqam
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Kitto faqat haqiqiy foydalanuvchilar platformasidir. Barcha a’zolar telefon raqamlarini tasdiqlagan bo‘lishi lozim. Sizning telefoningiz faqat o‘zaro almashuv taklifi tasdiqlangan taqdirda ko‘rsatiladi.
              </p>
            </div>
          </div>

          {/* Rule 5: Maxfiylik va Ma'lumotlar himoyasi */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
                5. Shaxsiy maʼlumotlar maxfiyligi (Privacy Policy)
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Sizning elektron pochtangiz, aniq turar joy koordinatalaringiz va shaxsiy xabarlaringiz uchinchi tomonlarga berilmaydi va tijoriy maqsadlarda sotilmaydi. Maʼlumotlar faqat kitob almashish va xavfsizlikni taʼminlash uchun ishlatiladi.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="p-6 sm:p-7 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-950 dark:text-red-200 mb-12">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm sm:text-base text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Qoidabuzarliklar uchun choralar</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            Kitobni o‘z vaqtida qaytarmagan, kitobga ziyon yetkazgan yoki boshqa kitobxonlarga noo‘rin munosabatda bo‘lgan foydalanuvchilarning akkaunti ogohlantirishsiz butunlay bloklanadi va telefon raqami platformaning qora ro‘yxatiga (Blacklist) kiritiladi.
          </p>
        </div>
      </main>

      {/* Mobile App Bottom Nav */}
      <BottomNav />
    </div>
  );
}
