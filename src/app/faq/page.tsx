'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, HelpCircle, Sparkles, MessageCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'Kitto xizmatidan foydalanish bepulmi?',
      a: 'Ha, Kitto platformasida ro‘yxatdan o‘tish, kitob joylash, xabarlashish va kitob almashish mutlaqo 100% BEPUL! Bizning asosiy maqsadimiz — kitobxonlik madaniyatini rivojlantirish va kitoblarning ikkinchi hayotini ta’minlashdir.',
    },
    {
      q: 'Doimiy almashuv bilan Vaqtincha mutolaaning qanday farqi bor?',
      a: 'Doimiy almashuvda kitoblar abadiy o‘rin almashadi (siz o‘z kitobingizni berasiz va boshqasini olasiz). Vaqtincha mutolaada esa kitob kelishilgan muddatga (masalan, 1 yoki 2 haftaga) o‘qishga beriladi va muddat tugagach egasiga qaytariladi.',
    },
    {
      q: 'Agar kimdir kitobimni qaytarmasa nima bo‘ladi?',
      a: 'Kitto’da har bir almashuv QR-kod va telefon raqami orqali qayd etiladi. Qaytarish muddati o‘tganda tizim eslatma yuboradi. Agar foydalanuvchi kitobni qaytarishdan bosh tortsa, uning akkaunti bloklanadi, reytingi 0 ga tushadi va telefon raqami "Ishonchsizlar qora ro‘yxati"ga tushadi.',
    },
    {
      q: 'Toshkentdan boshqa viloyatlar qachon ulanadi?',
      a: 'Hozirda Kitto Toshkent shahrida faoliyat yuritmoqda. Saytimizdagi "Hududlar" tugmasi orqali o‘z viloyatingizga ovoz bering. Viloyat bo‘yicha 100 ta ovoz yig‘ilishi bilan o‘sha hududda ham rasmiy ochilish e’lon qilinadi.',
    },
    {
      q: 'Kitob holatini qanday to‘g‘ri baholash kerak?',
      a: 'Kitto’da 3 xil holat mavjud: "Yangi" — umuman o‘qilmagan yoki do‘kondan olingandek yangi; "A’lo" — o‘qilgan, lekin varaqlarida dog‘ va yirtiqlar yo‘q; "Yaxshi" — biroz eskirgan yoki xatcho‘p izlari bor, lekin barcha sahifalari to‘liq.',
    },
    {
      q: 'Nega telefon raqam kiritish majburiy?',
      a: 'Xavfsizlik va mas’uliyatni ta’minlash maqsadida har bir a’zodan haqiqiy O‘zbekiston telefon raqami so‘raladi. Bu kitob egalari bilan uchrashuv vaqtida tezkor aloqa o‘rnatishga xizmat qiladi.',
    },
    {
      q: 'Uchrashuv joyini qayerda belgilash ma’qul?',
      a: 'Biz doimo shahar metrosi bekatlari vestibyullari, gavjum qahvaxonalar yoki kutubxonalar yonida uchrashishni tavsiya qilamiz. Ikkala tomon uchun ham qulay va yorug‘ joyni tanlang.',
    },
    {
      q: 'Hadya (bepul sovg‘a) qilish qanday ishlaydi?',
      a: 'Agar kitobingizni kimgadir shunchaki yaxshilik sifatida bermoqchi bo‘lsangiz, e’lon turini "Hadya qilinadi" deb belgilang. Qiziqqan kitobxon siz bilan bog‘lanib, o‘zi kelib olib ketishi mumkin.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <HelpCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Ko‘p beriladigan savollar
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Kitto platformasi ishlashi, kitob almashish shartlari va xavfsizlik borasidagi eng muhim savollarga javoblar.
          </p>
        </div>

        {/* Accordion FAQ list */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-center">
          <MessageCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1">
            Savolingizga javob topmadingizmi?
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">
            Telegram qo‘llab-quvvatlash botimiz yoki bevosita operatorlarimiz bilan bog‘laning.
          </p>
          <a
            href="https://t.me/kitto_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>Telegramda yozish</span>
            <span>&rarr;</span>
          </a>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
