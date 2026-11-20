'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  MapPin,
  ChevronDown,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Compass,
  BookMarked,
  ArrowLeftRight,
  UserCheck,
  Check,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroExchangeShowcase } from '@/components/HeroExchangeShowcase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, loginWithGoogle, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleGoogleAction = async () => {
    if (isAuthenticated) {
      router.push('/catalog');
    } else {
      try {
        await loginWithGoogle();
      } catch {
        openAuthModal('Google orqali kirishda xatolik yuz berdi');
      }
    }
  };

  const faqs = [
    {
      q: 'Kitto xizmatidan foydalanish bepulmi?',
      a: 'Ha, Kitto platformasida ro‘yxatdan o‘tish, kitob joylash, boshqa kitobxonlar bilan xabarlashish va kitob almashish mutlaqo 100% BEPUL! Bizning bosh maqsadimiz — kitobxonlik madaniyatini rivojlantirish va kitoblarning javonda chang bosib yotishiga yo‘l qo‘ymaslikdir.',
    },
    {
      q: 'Doimiy almashuv bilan Vaqtincha mutolaaning qanday farqi bor?',
      a: 'Doimiy almashuvda kitoblar abadiy o‘rin almashadi (siz o‘z kitobingizni berasiz va boshqasini olasiz). Vaqtincha mutolaada esa kitob kelishilgan muddatga (masalan, 14 kunga) o‘qishga beriladi va o‘qib bo‘lingach o‘z egasiga qaytariladi.',
    },
    {
      q: 'Agar kimdir kitobimni qaytarmasa nima bo‘ladi?',
      a: 'Kitto’da har bir almashuv tekshirilgan profil va haqiqiy telefon raqamlari orqali kafolatlanadi. Qaytarish muddati yaqinlashganda eslatmalar yuboriladi. Agar kimdir kitobni qaytarishdan bosh tortsa, uning akkaunti butunlay bloklanadi va telefon raqami "Ishonchsizlar qora ro‘yxati"ga kiritiladi.',
    },
    {
      q: 'Toshkentdan boshqa viloyatlar ham bormi?',
      a: 'Hozirda Kitto rasman Toshkent shahrining barcha 12 ta tumanida faol ishlamoqda. Viloyatlardagi kitobxonlar ham o‘z hududlari uchun saytda ovoz berishlari mumkin. Viloyat bo‘yicha 100 ta ovoz yig‘ilishi bilan u yerda ham rasmiy ochilish e’lon qilinadi.',
    },
    {
      q: 'Kitob holatini qanday to‘g‘ri baholash kerak?',
      a: 'Platformamizda 3 xil holat mavjud: "Yangi" — umuman o‘qilmagan yoki do‘kondan olingandek yangi; "A’lo" — o‘qilgan, lekin sahifalarida dog‘ yoki yirtiqlar yo‘q; "Yaxshi" — biroz eskirgan yoki xatcho‘p izlari bor, lekin mutolaa uchun to‘liq yaroqli.',
    },
    {
      q: 'Nega telefon raqam kiritish majburiy?',
      a: 'Xavfsizlik va mas’uliyatni ta’minlash maqsadida har bir a’zodan haqiqiy O‘zbekiston telefon raqami so‘raladi. Bu kitob egalari bilan uchrashuv vaqtida tezkor aloqa o‘rnatishga xizmat qiladi.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Global Uniform Header */}
      <Header />

      <main className="flex-1">
        {/* 2. HERO SECTION WITH THREE.JS 3D OPENING BOOK */}
        <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-stone-200/70 dark:border-stone-800/80">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-amber-500/10 dark:bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 w-[500px] h-[340px] bg-amber-600/10 dark:bg-amber-600/5 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Hero Copywriting & CTAs */}
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* Live Platform Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-bold shadow-2xs backdrop-blur-md mb-4 sm:mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Toshkentning 1-raqamli P2P Kitob Hamjamiyati</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 dark:text-stone-50 tracking-tight leading-[1.12] mb-3 sm:mb-6">
                  Kitoblaringizga yangi hayot bering —{' '}
                  <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500 drop-shadow-2xs">
                    O‘qing, Almashtiring, Ulashing
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-base md:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal mb-5 sm:mb-6">
                  Kitto — Toshkent bo‘ylab kitobxonlar o‘rtasida 100% bepul kitob almashish ekotizimi. Yangi kitob sotib olishga pul sarflamasdan, javondagi kitoblarni boshqalar bilan xolis va qulay almashing.
                </p>

                {/* Quick Trust Highlights */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6 sm:mb-8 text-[11px] sm:text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>100% Bepul almashuv</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Toshkent metro & tumanlar</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Ishonchli kafolat</span>
                  </span>
                </div>

                {/* Primary & Secondary Action Buttons (Compact & Ergonomic on Mobile) */}
                <div className="flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 mb-8 sm:mb-10 w-full max-w-md mx-auto lg:mx-0">
                  <Link
                    href="/catalog"
                    id="landing-hero-catalog-btn"
                    className="flex-1 sm:flex-initial px-4 py-3 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-95 flex items-center justify-center gap-2 transition-all duration-200 group border border-amber-400/40 text-center whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4 stroke-[2.2] shrink-0" />
                    <span>Katalogga o‘tish</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>

                  <button
                    onClick={handleGoogleAction}
                    id="landing-hero-google-btn"
                    className="flex-1 sm:flex-initial px-4 py-3 sm:px-7 sm:py-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 text-stone-900 dark:text-stone-100 text-xs sm:text-base font-bold shadow-xs active:scale-95 flex items-center justify-center gap-2 transition-all duration-200 backdrop-blur-xs text-center whitespace-nowrap"
                  >
                    {isAuthenticated ? (
                      <>
                        <span>Kabinetim</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Kirish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Visual P2P Book Exchange Showcase (Modern, Lightweight & Fluid) */}
              <div className="lg:col-span-5 flex items-center justify-center relative">
                <HeroExchangeShowcase className="w-full" />
              </div>
            </div>

            {/* 3. PLATFORM CAPABILITY CARDS (100% Real, Honest & Dignified) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-14 sm:mt-20">
              {/* Card 1: 0 so'm / Free */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-500 tracking-tight">
                  0 so‘m
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                  100% Xolis & Bepul
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Sotuv yo‘q, ijara haqi yo‘q. Faqat kitobxonlar o‘rtasida xolis almashuv va hadya.
                </p>
              </div>

              {/* Card 2: P2P Direct */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <ArrowLeftRight className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
                  P2P
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                  To‘g‘ridan-to‘g‘ri aloqa
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Vositachilarsiz: o‘zingizga ma’qul kitob egasi bilan ichki chatda to‘g‘ridan-to‘g‘ri suhbatlashing.
                </p>
              </div>

              {/* Card 3: Ishonchli Kafolat */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
                  Kafolat
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                  Xavfsiz topshirish
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Har bir topshirish va qabul qilish tizimda bir martalik tasdiq orqali muhrlanadi. Kitobingiz yo‘qolmaydi.
                </p>
              </div>

              {/* Card 4: Verified Community */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                  Ishonchli
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                  Tasdiqlangan kitobxonlar
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Barcha a’zolar tekshirilgan profil va haqiqiy telefon raqamlari orqali faoliyat yuritadi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. STORY & MISSION (Tarix va Missiya) */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Mission Narrative */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
                  <span>Tarix va Missiya</span>
                  <span>•</span>
                  <span>2024-yildan buyon</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-6">
                  Kitto nima o‘zi va qachon tashkil topgan?
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                  <p>
                    <strong className="text-stone-900 dark:text-stone-100 font-bold">Kitto</strong> — 2024-yilda Toshkent shahrida bir guruh kitobsevar yoshlar tashabbusi bilan asos solingan erkin, mustaqil va notijorat kitob almashish ekotizimidir.
                  </p>
                  <p>
                    Bugungi kunda yangi kitoblar narxi ancha qimmatlashgani ko‘pchilikka maʼlum. Boshqa tomondan, har bir kitobxonning xonadonida o‘qib bo‘lingan va shunchaki tokchada chang bosib yotgan o‘nlab sara asarlar bor.
                  </p>
                  <p className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 text-stone-800 dark:text-stone-200 italic font-medium">
                    “Bizning maqsadimiz — kitobxonlarni bir-biri bilan to‘g‘ridan-to‘g‘ri bog‘lash, kitob xaridi uchun ortiqcha xarajat qilmasdan yangi bilimlarga erkin ega bo‘lish va har bir kitobga ikkinchi, uchinchi bor hayot baxsh etishdir!”
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <span>Katalogdagi kitoblarni ko‘rish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/about"
                    className="px-4 py-3 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    Kitto manifesti
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Golden Rules Big Card */}
              <div className="lg:col-span-5">
                <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  <h3 className="font-sans text-xl font-black text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Bizning 3 ta oltin qoidamiz:</span>
                  </h3>

                  <div className="space-y-6">
                    {/* Rule 1 */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          100% Notijorat ekotizim
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          Kitto&#39;da kitob sotilmaydi yoki ijaraga berilmaydi. Faqat xolis almashuv yoki beg‘araz hadya qilinadi.
                        </p>
                      </div>
                    </div>

                    {/* Rule 2 */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <MapPin className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Xavfsiz & Qulay Uchrashuv
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          Shaharning eng qulay va gavjum jamoat maskanlarida bevosita ko‘rishib, o‘zaro ishonch bilan kitob almashasiz.
                        </p>
                      </div>
                    </div>

                    {/* Rule 3 */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                        <ShieldCheck className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Shaxsiy Mas&#39;uliyat & Kafolat
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          Hech bir kitob yo‘qolmaydi yoki o‘zlashtirilmaydi. Har bir a&#39;zo tekshirilgan profil va telefon raqami orqali javobgardir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. QANDAY ISHLAYDI? (4 ODDIY QADAM) */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                Oddiy jarayon
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Kitto qanday ishlaydi?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
                4 ta oson bosqichda istalgan kitobni bepul mutolaa qiling
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md relative group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                  01
                </div>
                <h3 className="font-sans text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Kitob joylang
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  O‘qib bo‘lgan kitobingiz rasmini oling va holati hamda almashish shartlarini belgilang.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md relative group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                  02
                </div>
                <h3 className="font-sans text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Qidiring & Tanlang
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Katalogdan yoki Toshkent xaritasidan sizga eng yaqin kitobni toping va tanlang.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md relative group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                  03
                </div>
                <h3 className="font-sans text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Suhbatda kelishing
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Telegram uslubidagi qulay chat orqali kitob egasi bilan qulay metro bekatida uchrashuv belgilang.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md relative group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                  04
                </div>
                <h3 className="font-sans text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Kitobni oling va mutolaa qiling
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Uchrashuv paytida kitobni topshiring, oling va maroq bilan mutolaa qilishni boshlang!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION (Accordion) */}
        <section className="py-20 sm:py-28 border-b border-stone-200/70 dark:border-stone-800/80 bg-white/40 dark:bg-stone-900/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                FAQ & Savollar
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Ko‘p beriladigan savollar
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
                Kitto platformasi ishlashi va xavfsizlik kafolatlari
              </p>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden transition-all duration-200 shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        openFaqIndex === idx ? 'rotate-180 text-amber-500' : 'text-stone-400'
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. BOTTOM CTA BANNER */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
                Kitobxonlar safiga siz ham qo‘shiling!
              </h2>
              <p className="text-sm sm:text-base text-amber-100 max-w-xl mx-auto mb-8 leading-relaxed">
                Tokchangizdagi kitoblarni yangilariga almashtiring, Toshkent bo‘ylab o‘zingizga qiziq mutolaa do‘stlarini toping.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/catalog"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-amber-900 font-extrabold text-sm shadow-lg hover:bg-amber-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Kitoblar katalogiga o‘tish</span>
                </Link>

                <button
                  onClick={handleGoogleAction}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-950/60 hover:bg-amber-950/80 border border-white/20 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Google orqali boshlash</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
