'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Book, SwapType, DurationPreset, BookLocation, SwapTerm } from '@/types/book';
import { compressBookImage } from '@/utils/imageCompressor';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Plus,
  Clock,
  ArrowLeftRight,
  Gift,
  Sparkles,
  Camera,
  Trash2,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { YandexMapPicker, Coordinates } from './YandexMapPicker';

const DURATION_PRESETS: { id: DurationPreset; label: string; text: string }[] = [
  { id: '1_week', label: '1 hafta', text: "1 haftaga o'qishga" },
  { id: '2_weeks', label: '2 hafta', text: "2 haftaga o'qishga" },
  { id: '1_month', label: '1 oy', text: "1 oyga o'qishga" },
  { id: 'until_finished', label: "O'qib bo'lguncha", text: "O'qib bo'lguncha" },
];

const CATEGORIES = [
  'Badiiy adabiyot',
  'Shaxsiy rivojlanish',
  'Biznes & Moliya',
  'IT & Dasturlash',
  'Tarix & Falsafa',
  'Psixologiya',
  'Chet tillari',
  'Boshqa',
];

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (newBook: Book) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
}) => {
  const { user, openAuthModal, openPhonePrompt, hasValidPhone } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<'yangi' | 'yaxshi' | 'oʻqilgan'>('yaxshi');

  // Real Photo Upload State
  const [coverUrl, setCoverUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Swap Terms Engine
  const [swapType, setSwapType] = useState<SwapType>('temporary');
  const [durationPreset, setDurationPreset] = useState<DurationPreset>('2_weeks');
  const [returnConditionNote, setReturnConditionNote] = useState('');

  // Location Engine
  const [addressText, setAddressText] = useState('Toshkent shahri');
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 41.311081, lng: 69.240562 });

  // Description
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      const err = "Faqat rasm formatidagi fayllar (JPG, PNG, WEBP) qabul qilinadi";
      setErrors((prev) => ({ ...prev, cover: err }));
      showToast(err, 'error');
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressBookImage(file, 800, 0.78);
      setCoverUrl(compressed);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cover;
        return next;
      });
      showToast("Rasm yuklandi va optimallashtirildi ✓", 'success');
    } catch (err) {
      console.error('Image compression error:', err);
      const errMsg = "Rasm yuklashda xatolik yuz berdi. Boshqa rasm tanlab ko'ring.";
      setErrors((prev) => ({
        ...prev,
        cover: errMsg,
      }));
      showToast(errMsg, 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCoverUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast("Rasm o'chirildi", 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal("Kitob eʼlonini joylash uchun tizimga kiring");
      return;
    }

    if (!user.contact || user.contact.includes('@') || !hasValidPhone) {
      openPhonePrompt("Kitob eʼlonini joylashtirish uchun telefon raqamingizni kiritish majburiy!");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!coverUrl) {
      newErrors.cover = "Iltimos, kitobning rasmini galereyadan yuklang.";
      showToast("Iltimos, kitobning rasmini galereyadan yuklang.", "error");
    }
    if (!title.trim()) newErrors.title = 'Kitob nomini kiriting';
    if (!author.trim()) newErrors.author = 'Muallif nomini kiriting';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let durationLabel = "Doimiy almashuv";
    if (swapType === 'gift') {
      durationLabel = "Bepul sovg'a";
    } else if (swapType === 'temporary') {
      const presetObj = DURATION_PRESETS.find((p) => p.id === durationPreset);
      durationLabel = presetObj ? presetObj.text : "2 haftaga o'qishga";
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
      city: 'Toshkent',
      location,
      swapTerm,
      status: 'active',
      ownerFavoriteGenres: user?.favoriteGenres || [],
      ownerWishlist: user?.wishlistBooks || [],
      createdAt: new Date().toISOString(),
      // backward compatibility fields
      type: swapType === 'gift' ? 'gift' : 'swap',
      exactLocation: location.addressText,
      coordinates: { lat: location.lat, lng: location.lng },
      isCompleted: false,
    };

    onAddBook(newBook);
    onClose();

    // Reset form state
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setDescription('');
    setReturnConditionNote('');
    setSwapType('temporary');
    setDurationPreset('2_weeks');
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-md modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-5 sm:p-7 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-zinc-800">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-200">
                <Plus className="w-4 h-4 stroke-[2.2]" />
              </span>
              Kitob joylash
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Toshkent boʻyicha kitobingizni boshqalar bilan ulashing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Section 1: Real Photo Upload Section (Required) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                Kitobning haqiqiy rasmi <span className="text-amber-600 dark:text-amber-400">*</span>
              </label>
              {coverUrl && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Haqiqiy rasm yuklandi</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-tight">
              Kitob haqiqatan sizda borligini tasdiqlash uchun uning muqovasini rasmga oling yoki galereyadan yuklang.
            </p>

            <input
              ref={fileInputRef}
              id="book-photo-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!coverUrl ? (
              <div
                id="book-photo-upload-zone"
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-[#141413] dark:border-stone-100 bg-amber-50/40 dark:bg-zinc-800/80 scale-[1.01]'
                    : errors.cover
                    ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20'
                    : 'border-stone-300 dark:border-zinc-700 hover:border-[#141413] dark:hover:border-stone-400 bg-stone-50/50 dark:bg-zinc-900/50'
                }`}
              >
                {isCompressing ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin" />
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Rasm optimallashtirilmoqda...
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-zinc-400">
                      Xotirani tejash uchun siqilmoqda
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-[#141413] dark:text-stone-100 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <Camera className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Galereyadan tanlash yoki rasmga olish
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-zinc-400 mt-0.5">
                        JPG, PNG, WEBP • Avtomatik siqiladi
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 shadow-xs mt-1">
                      <UploadCloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Rasmni tanlash</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Live Preview State */
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950 p-3 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative h-48 sm:h-52 aspect-[3/4] rounded-xl overflow-hidden shadow-book book-spine-effect border border-black/10 shrink-0 bg-stone-200 dark:bg-zinc-900">
                  <img
                    src={coverUrl}
                    alt="Kitob rasmi"
                    className="w-full h-full object-cover"
                  />
                  {/* Corner Badge */}
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#141413]/90 text-[#F8F7F4] backdrop-blur-md shadow-xs border border-white/10">
                    ✓ Haqiqiy rasm yuklandi
                  </span>
                </div>

                <div className="flex flex-col justify-between flex-1 w-full gap-3 py-1 text-center sm:text-left">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                      <ImageIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Haqiqiy muqova tayyor
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                      Ushbu fotosurat kitobxonlarga taqdim etiladi va kitobingiz ishonchliligini tasdiqlaydi.
                    </p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      id="change-book-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Boshqa rasm tanlash</span>
                    </button>

                    <button
                      type="button"
                      id="remove-book-photo-btn"
                      onClick={() => handleClearImage()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-700 hover:text-red-900 dark:text-red-400 border border-transparent hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O&#39;chirish</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.cover && (
              <p id="book-photo-error" className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
                {errors.cover}
              </p>
            )}
          </div>

          {/* Title & Author */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                Kitob nomi *
              </label>
              <input
                id="book-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="masalan: Atom Odatlar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400 transition-all"
              />
              {errors.title && (
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                Muallif *
              </label>
              <input
                id="book-author-input"
                type="text"
                required
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  if (errors.author) setErrors((prev) => ({ ...prev, author: '' }));
                }}
                placeholder="masalan: Jeyms Klir"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400 transition-all"
              />
              {errors.author && (
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{errors.author}</p>
              )}
            </div>

            {/* Category & Condition in a clean 2-column grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Kategoriya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Holati
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'yangi' | 'yaxshi' | 'oʻqilgan')}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
                >
                  <option value="yangi" className="bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100">Yangi</option>
                  <option value="yaxshi" className="bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100">A&apos;lo holatda</option>
                  <option value="oʻqilgan" className="bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100">O&apos;qilgan (yaxshi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: "Kitobni qanday shartda berasiz?" */}
          <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-zinc-900/90 border border-stone-200/90 dark:border-zinc-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                Kitobni qanday shartda berasiz?
              </label>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* 1. Vaqtincha o'qishga */}
                <button
                  type="button"
                  id="swap-term-temporary-btn"
                  onClick={() => setSwapType('temporary')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    swapType === 'temporary'
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 dark:border-amber-400 shadow-xs'
                      : 'bg-white dark:bg-zinc-900/70 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${swapType === 'temporary' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-zinc-500'}`} />
                    <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      Vaqtincha o&apos;qishga
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 ml-6">
                    Belgilangan muddatda o&apos;qib, qaytarib berish sharti bilan
                  </p>
                </button>

                {/* 2. Doimiy almashish */}
                <button
                  type="button"
                  id="swap-term-permanent-btn"
                  onClick={() => setSwapType('permanent')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    swapType === 'permanent'
                      ? 'bg-[#141413] text-[#F8F7F4] dark:bg-zinc-800 dark:border-stone-400 dark:text-stone-100 border-[#141413] shadow-xs'
                      : 'bg-white dark:bg-zinc-900/70 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className={`w-4 h-4 ${swapType === 'permanent' ? 'text-[#F8F7F4] dark:text-stone-100' : 'text-stone-400 dark:text-zinc-500'}`} />
                    <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      Doimiy almashish
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 ml-6">
                    Boshqa kitobga doimiy almashtirish
                  </p>
                </button>

                {/* 3. Hadya qilinadi */}
                <button
                  type="button"
                  id="swap-term-gift-btn"
                  onClick={() => setSwapType('gift')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    swapType === 'gift'
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 dark:border-amber-400 shadow-xs'
                      : 'bg-white dark:bg-zinc-900/70 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Gift className={`w-4 h-4 ${swapType === 'gift' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-zinc-500'}`} />
                    <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      Hadya qilinadi
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 ml-6">
                    Qaytarish shartisiz, bepul hadya
                  </p>
                </button>
              </div>
            </div>


            {/* Conditional Duration Selector (when swapType === 'temporary') */}
            {swapType === 'temporary' && (
              <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Qancha muddatga bera olasiz?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected = durationPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setDurationPreset(preset.id)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:border-stone-200 dark:text-stone-900 font-semibold shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Note input */}
            <div className="pt-2 border-t border-stone-200 dark:border-zinc-800">
              <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                Qo&#39;shimcha shart yoki izoh (ixtiyoriy)
              </label>
              <input
                type="text"
                value={returnConditionNote}
                onChange={(e) => setReturnConditionNote(e.target.value)}
                placeholder="masalan: Varag'iga qalam bilan yozmaslik so'raladi"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400"
              />
            </div>
          </div>

          {/* Map Location Section */}
          <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-zinc-900/90 border border-stone-200/90 dark:border-zinc-800">
            <YandexMapPicker
              initialCoordinates={coordinates}
              onCoordinatesChange={setCoordinates}
              onAddressChange={setAddressText}
            />
          </div>

          {/* Optional Book Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
              Kitob haqida qo&#39;shimcha ma&#39;lumot (ixtiyoriy)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kitobning qaysi tomoni sizga yoqqani yoki qisqacha tavsif..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 dark:focus:border-stone-400 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="add-book-submit-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
              <span>E&#39;lon joylash</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
