'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Repeat,
  MessageSquare,
  QrCode,
  Users,
  Compass,
  Sparkles,
  MapPin,
  ChevronDown,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { booksService } from '@/services/db';
import { Book } from '@/types/book';
import { BookDetailModal } from '@/components/BookDetailModal';

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, loginWithGoogle, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Load latest live books for showcase
  useEffect(() => {
    booksService
      .getBooks()
      .then((items) => {
        if (items && items.length > 0) {
          setFeaturedBooks(items.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  };

  const handleGoogleAction = async () => {
    if (isAuthenticated) {
      router.push('/cabinet');
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
      a: 'Ha, Kitto platformasida ro‘yxatdan o‘tish, kitob joylash, boshqa kitobxonlar bilan yozishish va kitob almashish mutlaqo 100% BEPUL! Bizning maqsadimiz — kitobxonlik madaniyatini rivojlantirish va kitoblarning javonda chang bosib yotishiga yo‘l qo‘ymaslikdir.',
    },
    {
      q: 'Doimiy almashuv bilan Vaqtincha mutolaaning qanday farqi bor?',
      a: 'Doimiy almashuvda kitoblar abadiy o‘rin almashadi (siz o‘z kitobingizni berasiz va boshqasini olasiz). Vaqtincha mutolaada esa kitob kelishilgan muddatga (masalan, 14 kunga) o‘qishga beriladi va o‘qib bo‘lingach o‘z egasiga qaytariladi.',
    },
    {
      q: 'Agar kimdir kitobimni qaytarmasa nima bo‘ladi?',
      a: 'Kitto’da har bir almashuv QR-kod va tekshirilgan telefon raqami orqali kafolatlanadi. Qaytarish muddati yaqinlashganda eslatmalar yuboriladi. Agar kimdir kitobni qaytarishdan bosh tortsa, uning akkaunti butunlay bloklanadi va telefon raqami "Ishonchsizlar qora ro‘yxati"ga kiritiladi.',
    },
    {
      q: 'Toshkentdan boshqa viloyatlar ham bormi?',
      a: 'Hozirda Kitto rasman Toshkent shahrining barcha 12 ta tumanida faol ishlamoqda. Viloyatlardagi kitobxonlar ham o‘z hududlari uchun saytda ovoz berishlari mumkin. Viloyat bo‘yicha 100 ta ovoz yig‘ilishi bilan u yerda ham ochilish e’lon qilinadi.',
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
      {/* 1. Header */}
      <Header />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 border-b border-stone-200/70 dark:border-stone-800/80">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Top Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-semibold shadow-2xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
                <span>Toshkentning 1-raqamli P2P Kitob Almashish Hamjamiyati</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
                Kitoblaringizga yangi hayot bering —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">
                  O&#39;qing, Almashtiring, Ulashing
                </span>
              </h1>
              <p className="mt-5 text-sm sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-normal max-w-2xl mx-auto">
                Kitto — Toshkent bo‘ylab kitobxonlar o‘rtasida 100% bepul kitob almashish ekotizimi. Tokchalarda chang bosib yotgan kitoblarni bepul oling yoki o&#39;z kitoblaringiz bilan do&#39;stona almashing.
              </p>
            </div>

            {/* Prominent CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
              <Link
                href="/catalog"
                id="landing-hero-catalog-btn"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2.5 transition-all text-center"
              >
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                <span>Katalogga o&#39;tish (Kitoblar lentasi)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleGoogleAction}
                id="landing-hero-google-btn"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 text-stone-900 dark:text-stone-100 text-sm font-bold shadow-xs active:scale-95 flex items-center justify-center gap-2.5 transition-all"
              >
                {isAuthenticated ? (
                  <>
                    <span>Kabinetimga kirish</span>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google orqali ro&#39;yxatdan o&#39;tish</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Stats Counter Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs text-center backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-500">1,200+</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Almashilgan kitoblar</div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs text-center backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">4,500+</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Faol kitobxonlar</div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs text-center backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-500">100%</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Mutlaqo bepul</div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs text-center backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">12 ta</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Toshkent tumanlari</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. KITTO NIMA VA QACHON TASHKIL TOPGAN? (STORY & MISSION) */}
        <section className="py-16 sm:py-20 border-b border-stone-200/70 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                  Tarix va Missiya
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-4">
                  Kitto nima o&#39;zi va qachon tashkil topgan?
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  <p>
                    <strong className="text-stone-900 dark:text-stone-100">Kitto</strong> — 2024-yilda Toshkent shahrida bir guruh kitobsevar yoshlar tashabbusi bilan asos solingan erkin, mustaqil va notijorat kitob almashish ekotizimidir.
                  </p>
                  <p>
                    Bugungi kunda yangi kitoblar narxi ancha qimmatlashgani ko&#39;pchilikka ma&#39;lum. Boshqa tomondan, har bir kitobxonning xonadonida o&#39;qib bo&#39;lingan va shunchaki tokchada chang bosib yotgan o&#39;nlab sara asarlar bor.
                  </p>
                  <p>
                    Bizning maqsadimiz — kitobxonlarni bir-biri bilan to&#39;g&#39;ridan-to&#39;g&#39;ri bog&#39;lash, kitob xaridi uchun ortiqcha xarajat qilmasdan yangi bilimlarga erkin ega bo&#39;lish va har bir kitobga ikkinchi, uchinchi bor hayot baxsh etishdir!
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline"
                  >
                    <span>Katalogdagi kitoblarni ko&#39;rish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <Link
                    href="/about"
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                  >
                    Batafsil manifest
                  </Link>
                </div>
              </div>

              {/* Graphic Feature Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-5 shadow-xs">
                  <Heart className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Bizning 3 ta oltin qoidamiz:
                </h3>
                <ul className="space-y-3.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Notijorat:</strong> Kitto’da kitob sotilmaydi yoki ijaraga berilmaydi. Faqat xolis almashuv yoki hadya.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Metro & Qulay Uchrashuv:</strong> Toshkentning barcha metro bekatlari va markazlarida bevosita ko&#39;rishib almashasiz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>QR-kod Kafolati:</strong> Hech bir kitob yo&#39;qolmaydi yoki o&#39;zlashtirilmaydi, har bir qadam tizimda qayd etiladi.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. QANDAY ISHLAYDI? (4 OSON QADAM) */}
        <section id="how-it-works" className="py-16 sm:py-20 border-b border-stone-200/70 dark:border-stone-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                Oddiy va Tezkor
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Kitto qanday ishlaydi?
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Bor-yo&#39;g&#39;i 4 ta oddiy qadam orqali sevimli kitobingizni mutolaa qiling
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                <div className="text-amber-600 dark:text-amber-500 text-xs font-black tracking-widest mb-3">QADAM 01</div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">Kitobni joylang</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Javoningizdagi kitobni 30 soniyada suratga olib joylang. Nomi, holati va qulay uchrashuv tumanini belgilang.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                <div className="text-amber-600 dark:text-amber-500 text-xs font-black tracking-widest mb-3">QADAM 02</div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">Kitobxonni toping</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Katalogdan o&#39;zingiz xohlagan asarni qidiring. Tumaningizga yaqin kitobxonlar bilan xabarlar orqali bog&#39;laning.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                <div className="text-amber-600 dark:text-amber-500 text-xs font-black tracking-widest mb-3">QADAM 03</div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">QR Tasdiqlash</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Metro yoki xiyobonda uchrashing. Shaxsiy QR-kodni skanerlash orqali almashuvni xavfsiz rasmiylashtiring.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                <div className="text-amber-600 dark:text-amber-500 text-xs font-black tracking-widest mb-3">QADAM 04</div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Repeat className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">Mutolaa qiling</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Kitobni bepul o&#39;qib chiqing. Kelishilgan muddatda qaytaring yoki doimiy almashuv orqali javoningizni boyiting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. JONLI KITOOBLAR KO'RGAZMASI (FEATURED BOOKS SHOWCASE) */}
        {featuredBooks.length > 0 && (
          <section className="py-16 sm:py-20 border-b border-stone-200/70 dark:border-stone-800/80 bg-stone-100/40 dark:bg-stone-900/20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Jonli Lenta
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                    Hozirda almashishga tayyor kitoblar
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Toshkentdagi kitobxonlar tomonidan yaqinda joylangan asarlar
                  </p>
                </div>

                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100 hover:border-amber-600 transition-colors shadow-2xs"
                >
                  <span>Barcha kitoblarni ko&#39;rish</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                </Link>
              </div>

              {/* Book Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {featuredBooks.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleBookClick(b)}
                    className="group cursor-pointer rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-500/50 transition-all flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      {b.coverUrl ? (
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <BookOpen className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                          {b.swapTerm?.type === 'gift' ? 'Hadya' : b.swapTerm?.type === 'temporary' ? 'Mutolaaga' : 'Almashuv'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {b.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {b.author}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500">
                        <span className="truncate max-w-[100px] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                          <span>{b.location?.addressText || b.exactLocation || 'Toshkent'}</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">&rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Big Catalog Link Callout */}
              <div className="mt-10 text-center">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Katalogga o&#39;tish va barcha kitoblarni qidirish</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 6. XAVFSIZLIK VA ISHONCH (SAFETY) */}
        <section id="safety" className="py-16 sm:py-20 border-b border-stone-200/70 dark:border-stone-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                Xavfsiz va Kafolatlangan
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Xavfsizlik va Kitobxonlik Madaniyati
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Har bir a&#39;zoimiz o&#39;zaro ishonch va mas&#39;uliyat bilan harakat qilishi ta&#39;minlangan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-xs">
                  <QrCode className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">QR-kod orqali tasdiqlash</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Kitob qabul qilinganida va qaytarilganida tomonlar shaxsiy QR-kodni skanerlaydi. Bu orqali almashuv holati 100% rasman qayd etiladi.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-xs">
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">14 kunlik bepul mutolaa</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Vaqtincha olingan kitoblar 14 kun ichida egasiga toza va avaylab qaytariladi. Muddat tugashidan 2 kun oldin tizim avtomatik eslatma yuboradi.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">Qoidabuzarlar uchun bloklash</h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Kitobni qaytarmagan yoki ziyon yetkazgan a&#39;zolarning telefon raqami va akkaunti bir umrga tizimdan bloklanadi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. KO'P SO'RALADIGAN SAVOLLAR (FAQ ACCORDION) */}
        <section id="faq" className="py-16 sm:py-20 border-b border-stone-200/70 dark:border-stone-800/80 bg-white/40 dark:bg-stone-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                Savollarga Javoblar
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Ko&#39;p so&#39;raladigan savollar
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Kitto platformasi haqida barcha qiziqtirgan savollaringizga ochiq javoblar
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 hover:text-amber-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-amber-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 pt-3 animate-in fade-in duration-150">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. BOTTOM HERO CTA BANNER */}
        <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-b from-[#FAF9F5] to-amber-500/10 dark:from-stone-950 dark:to-stone-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-4">
              Kitobxonlar safiga siz ham qo&#39;shiling!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Tokchangizdagi kitoblarni yangilariga almashtiring, Toshkent bo&#39;ylab o&#39;zingizga qiziq mutolaa do&#39;stlarini toping.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                <span>Katalogga o&#39;tish (Kitoblar lentasi)</span>
              </Link>

              <button
                onClick={handleGoogleAction}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-stone-400 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-bold shadow-xs active:scale-95 flex items-center justify-center gap-2 transition-all"
              >
                <span>Google orqali boshlash</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          onStartChat={(b) => {
            setIsDetailModalOpen(false);
            router.push(`/messages?bookId=${b.id}`);
          }}
          onOpenSwapModal={(b) => {
            setIsDetailModalOpen(false);
            router.push(`/messages?bookId=${b.id}`);
          }}
          onToggleSave={() => {
            showToast('Kitob saqlandi', 'success');
          }}
          isSaved={false}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
