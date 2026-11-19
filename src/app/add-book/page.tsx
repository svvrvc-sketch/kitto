'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  BookOpen,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Trash2,
  UploadCloud,
  Clock,
  ArrowLeftRight,
  Gift,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Book, SwapType, DurationPreset, BookLocation, SwapTerm } from '@/types/book';
import { booksService } from '@/services/db';
import { uploadImageToStorage } from '@/utils/storage';
import { YandexMapPicker, Coordinates } from '@/components/YandexMapPicker';
import { LogoIcon } from '@/components/Logo';

const BOOK_CATEGORIES = [
  'Badiiy adabiyot',
  'Jahon adabiyoti',
  'Biznes va moliya',
  'Shaxsiy rivojlanish',
  'Psixologiya',
  'IT va dasturlash',
  'Tarix va falsafa',
  'Bolalar adabiyoti',
  'Ilmiy-ommabop',
  'Detektiv va triller',
  'Boshqa',
];

const DURATION_PRESETS: { id: DurationPreset; label: string; text: string }[] = [
  { id: '1_week', label: '1 hafta', text: "1 haftaga o'qishga" },
  { id: '2_weeks', label: '2 hafta', text: "2 haftaga o'qishga" },
  { id: '1_month', label: '1 oy', text: "1 oyga o'qishga" },
];

function AddBookContent() {
  const router = useRouter();
  const { user, openAuthModal, openPhonePrompt, hasValidPhone } = useAuth();
  const { showToast } = useToast();

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Badiiy adabiyot');
  const [condition, setCondition] = useState<Book['condition']>('Yaxshi');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Swap options
  const [swapType, setSwapType] = useState<SwapType>('permanent');
  const [durationPreset, setDurationPreset] = useState<DurationPreset>('2_weeks');
  const [returnConditionNote, setReturnConditionNote] = useState('');

  // Geolocation
  const [addressText, setAddressText] = useState('Toshkent shahri');
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 41.311081,
    lng: 69.240562,
  });

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Faqat rasm formatidagi fayllar qabul qilinadi', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'covers');
      setCoverUrl(url);
      showToast('Rasm muvaffaqiyatli yuklandi', 'success');
    } catch {
      showToast('Rasm yuklashda xatolik yuz berdi', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal('Kitob joylash uchun tizimga kiring');
      return;
    }

    if (!user.contact || user.contact.includes('@') || !hasValidPhone) {
      openPhonePrompt('Kitob eʼlonini joylashtirish uchun telefon raqamingizni kiritish majburiy!');
      return;
    }

    if (!coverUrl) {
      showToast('Iltimos, kitobning haqiqiy rasmini yuklang', 'error');
      return;
    }

    if (!title.trim() || !author.trim()) {
      showToast('Kitob nomi va muallifini kiriting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let durationLabel = 'Doimiy almashuv';
      if (swapType === 'gift') {
        durationLabel = "Bepul sovg'a";
      } else if (swapType === 'temporary') {
        const p = DURATION_PRESETS.find((x) => x.id === durationPreset);
        durationLabel = p ? p.text : "2 haftaga o'qishga";
      }

      const swapTerm: SwapTerm = {
        type: swapType,
        durationPreset: swapType === 'temporary' ? durationPreset : undefined,
        durationLabel,
        returnConditionNote: returnConditionNote.trim() || undefined,
      };

      const location: BookLocation = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        addressText: addressText || 'Toshkent shahri',
      };

      const newBook: Book = {
        id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        author: author.trim(),
        category,
        condition,
        description: description.trim() || undefined,
        coverUrl,
        ownerId: user.id,
        ownerName: user.name || 'Kitobxon',
        ownerContact: user.contact,
        city: user.city || 'Toshkent shahri',
        location,
        swapTerm,
        status: 'active',
        ownerFavoriteGenres: user.favoriteGenres || [],
        ownerWishlist: user.wishlistBooks || [],
        createdAt: new Date().toISOString(),
        type: swapType === 'gift' ? 'gift' : 'swap',
        exactLocation: location.addressText,
        coordinates: { lat: location.lat, lng: location.lng },
        isCompleted: false,
      };

      await booksService.addBook(newBook);
      showToast('Kitob muvaffaqiyatli joylashtirildi!', 'success');
      router.push('/cabinet?tab=my_books');
    } catch (err) {
      console.error('Book add error:', err);
      showToast('Kitob joylashda xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {/* Clean Store Header */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs">
                <LogoIcon size={20} />
              </div>
              <span className="font-serif text-lg font-bold">Kitto</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Do&#39;konga qaytish</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cabinet"
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-semibold"
            >
              Kabinetim
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 min-h-screen">
        {/* Content Body */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bosh sahifaga qaytish</span>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Yangi kitob eʼlonini joylashtirish
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
              Oʻzingizdagi kitobni boshqa kitobxonlar bilan doimiy yoki vaqtincha almashishga qoʻying.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Real Photo Section */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-base font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Kitobning haqiqiy fotosurati *</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kitob haqiqatdan ham sizda borligini koʻrsatish uchun uning muqovasini rasmga olib yuklang
                  </p>
                </div>
                {coverUrl && (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Yuklandi</span>
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!coverUrl ? (
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-stone-900 dark:hover:border-stone-100 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-stone-50/50 dark:bg-zinc-850/50 group"
                >
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-200 shadow-sm group-hover:scale-105 transition-transform">
                    {isUploading ? (
                      <div className="w-8 h-8 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-8 h-8 stroke-[1.8]" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {isUploading ? 'Rasm optimallashtirilmoqda...' : 'Rasm yuklash uchun bosing'}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                      Kamera orqali rasmga oling yoki galereyadan tanlang (JPG, PNG, WEBP)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-stone-200 dark:border-zinc-700 shadow-book group mx-auto sm:mx-0">
                  <img src={coverUrl} alt="Tanlangan kitob" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-2 rounded-xl bg-black/70 hover:bg-black text-white backdrop-blur-xs transition-colors shadow-sm"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Book Info Section */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial space-y-5">
              <h2 className="font-serif text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kitob maʼlumotlari</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                    Kitob nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: Ufq yoki Atom odatlari"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                    Muallif *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Masalan: Said Ahmad yoki Jeyms Klir"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                    Janr / Kategoriya *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                    Kitob holati *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Yangi', "A'lo", 'Yaxshi', "O'rtacha"] as const).map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                          condition === cond
                            ? 'bg-[#141413] text-white dark:bg-stone-100 dark:text-stone-900 border-[#141413]'
                            : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                  Qisqacha tavsif yoki izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kitob haqida taassurotlaringiz, tili yoki tarjimasi haqida maʼlumot..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* 3. Swap Terms Section */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial space-y-5">
              <h2 className="font-serif text-base font-bold flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Almashuv shartlari *</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setSwapType('permanent')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    swapType === 'permanent'
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-zinc-850 shadow-xs'
                      : 'border-stone-200 dark:border-zinc-700 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    {swapType === 'permanent' && <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />}
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Doimiy almashuv</div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      Kitobni boshqa bir kitobga butunlay almashing.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSwapType('temporary')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    swapType === 'temporary'
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-zinc-850 shadow-xs'
                      : 'border-stone-200 dark:border-zinc-700 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    {swapType === 'temporary' && <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />}
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Vaqtincha mutolaaga</div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      Belgilangan muddatga oʻqish uchun bering va qaytarib oling.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSwapType('gift')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    swapType === 'gift'
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-zinc-850 shadow-xs'
                      : 'border-stone-200 dark:border-zinc-700 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    {swapType === 'gift' && <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />}
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Bepul hadya</div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      Kitobxonlarga xolis bepul sovgʻa qiling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Temporary duration presets */}
              {swapType === 'temporary' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-3 animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-amber-950 dark:text-amber-200">
                    Mutolaa muddati:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setDurationPreset(preset.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          durationPreset === preset.id
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Qaytarish sharti (ixtiyoriy eslatma)
                    </label>
                    <input
                      type="text"
                      value={returnConditionNote}
                      onChange={(e) => setReturnConditionNote(e.target.value)}
                      placeholder="Masalan: Varaqlarini bukmay, toza holda qaytarish sharti bilan"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Location Section */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-editorial space-y-5">
              <h2 className="font-serif text-base font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kitob joylashgan manzil (Xarita)</span>
              </h2>
              <p className="text-xs text-stone-500">
                Boshqa kitobxonlar oʻzlariga eng yaqin kitoblarni topishlari uchun xaritada belgilang.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
                  Moʻljal yoki manzil matni
                </label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Masalan: Chilonzor 9-mavze, metro bekati yonida"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-700">
                <YandexMapPicker
                  initialCoordinates={coordinates}
                  onCoordinatesChange={(coords) => setCoordinates(coords)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/"
                className="px-5 py-3 rounded-2xl border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50"
              >
                Bekor qilish
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Joylashtirilmoqda...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Kitobni eʼlon qilish</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default function AddBookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 flex items-center justify-center">
          <div className="animate-pulse font-serif text-lg text-stone-600">Yuklanmoqda...</div>
        </div>
      }
    >
      <AddBookContent />
    </Suspense>
  );
}
