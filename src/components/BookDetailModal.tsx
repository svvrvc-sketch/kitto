'use client';

import React, { useEffect, useState } from 'react';
import { Book } from '@/types/book';
import {
  X,
  MapPin,
  Share2,
  Bookmark,
  Check,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Trash2,
  Navigation,
  ZoomIn,
  BookOpen,
  Camera,
  Clock,
  ShieldCheck,
  QrCode,
  Send,
  Copy,
  MessageCircle,
  ArrowLeftRight,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { YandexMapPicker } from './YandexMapPicker';
import { calculateDistanceKm, formatDistance } from '@/lib/geo-utils';
import { formatBookCondition } from '@/lib/book-constants';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSave?: (bookId: string) => void;
  onDeleteBook?: (bookId: string) => void;
  onToggleComplete?: (bookId: string) => void;
  onStartChat?: (book: Book) => void;
  onGoToMyListings?: () => void;
  onOpenUserProfile?: (userId: string) => void;
  onOpenQRModal?: (book: Book, mode: 'handover' | 'return') => void;
  onOpenSwapModal?: (book: Book) => void;
  isSaved?: boolean;
  userCoordinates?: { lat: number; lng: number } | null;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onToggleSave,
  onDeleteBook,
  onToggleComplete,
  onStartChat,
  onGoToMyListings,
  onOpenUserProfile,
  onOpenQRModal,
  onOpenSwapModal,
  isSaved = false,
  userCoordinates = null,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [effectiveUserCoords, setEffectiveUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(userCoordinates || null);

  useEffect(() => {
    if (userCoordinates) {
      setEffectiveUserCoords(userCoordinates);
    } else {
      try {
        const stored = sessionStorage.getItem('kitto_user_coords') || sessionStorage.getItem('bookswap_user_coords');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.lat === 'number') {
            setEffectiveUserCoords(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [userCoordinates, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPhotoZoomed) {
          setIsPhotoZoomed(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
      setConfirmDelete(false);
      setIsPhotoZoomed(false);
    };
  }, [isOpen, onClose, isPhotoZoomed]);

  if (!isOpen || !book) return null;

  // Authentic physical book photo check
  const isRealPhoto = Boolean(
    book.coverUrl &&
    !book.coverUrl.includes('unsplash.com') &&
    (book.coverUrl.startsWith('data:image/') || book.coverUrl.startsWith('http'))
  );

  const isOwner = Boolean(user && book.ownerId && user.id === book.ownerId);

  const bookLat = book.location?.lat ?? book.coordinates?.lat ?? 41.311081;
  const bookLng = book.location?.lng ?? book.coordinates?.lng ?? 69.240562;
  const addressText = book.location?.addressText || book.exactLocation || 'Toshkent shahri';
  const isSwapped = book.status === 'swapped' || Boolean(book.isCompleted);

  const distanceKm =
    effectiveUserCoords && bookLat !== undefined && bookLng !== undefined
      ? calculateDistanceKm(effectiveUserCoords.lat, effectiveUserCoords.lng, bookLat, bookLng)
      : null;

  const yandexRouteUrl = effectiveUserCoords
    ? `https://yandex.uz/maps/?rtext=${effectiveUserCoords.lat},${effectiveUserCoords.lng}~${bookLat},${bookLng}&rtt=auto`
    : `https://yandex.uz/maps/?pt=${bookLng},${bookLat}&z=16&l=map`;

  const termType = book.swapTerm?.type || (book.type === 'gift' ? 'gift' : 'permanent');
  const durationLabel =
    book.swapTerm?.durationLabel ||
    (termType === 'gift'
      ? 'Hadya qilinadi'
      : termType === 'temporary'
      ? "Vaqtincha o'qishga"
      : 'Doimiy almashish');

  const isTemporary = termType === 'temporary';
  const isGift = termType === 'gift';
  const isTemporarilyGiven = book.status === 'temporarily_given';
  const isInactive = isSwapped || isTemporarilyGiven;

  const getActionLabel = () => {
    if (isGift) {
      return isSwapped ? 'Mavjud deb belgilash' : 'Topshirildi';
    }
    if (isTemporary) {
      return isTemporarilyGiven ? 'Faollashtirish' : "O'qilmoqda";
    }
    return isSwapped ? 'Almashishga tayyor' : 'Band qilish';
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/book/${book.id}`;
    }
    return `https://kitto-fakv.vercel.app/book/${book.id}`;
  };

  const getShareText = () => {
    const swapLabel = book.swapTerm?.durationLabel || durationLabel;
    const shareUrl = getShareUrl();
    return `"${book.title}" (${book.author}) — ${swapLabel}. Kitto.uz orqali ko'ring: ${shareUrl}`;
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast("Havola nusxalandi!", 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Havola nusxalandi!", 'success');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${book.title} — Kitto.uz`,
          text: getShareText(),
          url: getShareUrl(),
        });
        showToast("Muvaffaqiyatli ulashildi!", 'success');
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (err?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    }
  };

  const handleMessageClick = () => {
    if (!user) {
      openAuthModal("Kitob egasi bilan bog'lanish uchun tizimga kiring");
      return;
    }
    if (onStartChat) {
      onStartChat(book);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-md modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-6 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Temporarily Given status banner */}
        {isTemporarilyGiven && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Ushbu kitob hozir mutolaada
            </span>
          </div>
        )}

        {/* Completed status banner */}
        {isSwapped && (
          <div className="mb-4 p-3 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
              <CheckCircle className="w-4 h-4 text-stone-500 dark:text-zinc-400" />
              {isGift
                ? 'Ushbu kitob egasi tomonidan hadya qilib topshirilgan'
                : 'Ushbu kitob band qilingan yoki almashilgan'}
            </span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {termType === 'temporary' ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 text-[10px] font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                <span>Vaqtincha o&apos;qishga</span>
              </span>
            ) : termType === 'gift' ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 text-[10px] font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                <span>Hadya qilinadi</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-[#141413] text-[#F8F7F4] dark:bg-zinc-800 dark:text-stone-100 border border-black/10 dark:border-zinc-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                <span>Doimiy almashish</span>
              </span>
            )}
            <span className="inline-block border border-stone-200/60 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-800/80 text-stone-600 dark:text-stone-300 text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
              {formatBookCondition(book.condition)}
            </span>
          </div>


          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
              title="Ulashish"
            >
              {copied ? <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            {onToggleSave && (
              <button
                id="modal-save-btn"
                onClick={() => onToggleSave(book.id)}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
                title={isSaved ? "Saqlanganlardan chiqarish" : "Saqlash"}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Book Visual & Info */}
        <div className="flex gap-4 sm:gap-5 mt-4">
          <div
            id="book-detail-cover"
            onClick={() => {
              if (isRealPhoto && !imageError) {
                setIsPhotoZoomed(true);
              }
            }}
            className={`w-28 sm:w-36 aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-950 shadow-book book-spine-effect relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-gradient-to-r before:from-black/25 before:to-transparent before:z-10 before:pointer-events-none ${
              isRealPhoto && !imageError ? 'cursor-zoom-in group/cover' : ''
            }`}
            title={isRealPhoto && !imageError ? "Haqiqiy fotosuratni to'liq o'lchamda ko'rish uchun bosing" : undefined}
          >
            {isRealPhoto && !imageError ? (
              <>
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                />
                {/* Micro-badge for authentic photo */}
                <span className="absolute top-2 left-2 z-20 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#141413]/85 text-[#F8F7F4] backdrop-blur-xs shadow-xs border border-white/10 pointer-events-none flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5 text-amber-400" />
                  <span>Haqiqiy rasm</span>
                </span>
                {/* Hover zoom hint */}
                <div className="absolute inset-0 bg-stone-950/0 group-hover/cover:bg-stone-950/30 transition-colors flex items-center justify-center pointer-events-none z-20">
                  <span className="opacity-0 group-hover/cover:opacity-100 transition-opacity px-2 py-1 rounded-md bg-[#141413]/90 text-[#F8F7F4] text-[10px] font-medium backdrop-blur-sm flex items-center gap-1 shadow-md">
                    <ZoomIn className="w-3 h-3 text-amber-400" />
                    <span>Kattalashtirish</span>
                  </span>
                </div>
              </>
            ) : (
              /* Editorial Typographic Book Cover (Legacy fallback — never stock coffee photos) */
              <div className="flex h-full w-full flex-col justify-between bg-stone-100 dark:bg-zinc-900 p-3 select-none border-l-2 border-stone-300 dark:border-zinc-700">
                <div className="flex items-center justify-between opacity-60">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-stone-700 dark:text-stone-300">
                    Kitto
                  </span>
                  <BookOpen className="w-3 h-3 text-stone-700 dark:text-stone-300" />
                </div>
                <div className="my-auto py-1 text-center">
                  <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-3 leading-snug">
                    {book.title}
                  </h4>
                  <p className="font-serif italic text-[11px] text-stone-600 dark:text-stone-300 mt-1 line-clamp-1">
                    {book.author}
                  </p>
                </div>
                <div className="pt-1.5 border-t border-stone-300/60 dark:border-zinc-700/60 text-center text-[8px] text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                  {book.category || 'Kitob'}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300 mt-1">
                {book.author}
              </p>
              {book.category && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md border border-stone-200/80 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-800/80 text-stone-600 dark:text-stone-300">
                  {book.category}
                </span>
              )}
            </div>

            {/* Owner Snapshot */}
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <div
                id="book-detail-owner-profile-trigger"
                onClick={() => onOpenUserProfile && onOpenUserProfile(book.ownerId)}
                className="flex items-center gap-2 cursor-pointer group/owner hover:opacity-90 transition-opacity"
                title="Foydalanuvchi profilini ko'rish"
              >
                <div className="w-8 h-8 rounded-full bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] flex items-center justify-center font-bold text-xs group-hover/owner:scale-105 transition-transform shadow-xs">
                  {(book.ownerName || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                    <span className="group-hover/owner:underline underline-offset-2">{book.ownerName || 'Kitob egasi'}</span>
                    {(book.ownerIsTrusted || (book.ownerTrustScore && book.ownerTrustScore >= 3)) && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[9px] font-bold border border-amber-500/25">
                        <ShieldCheck className="w-3 h-3 text-amber-500" />
                        <span>Ishonchli kitobxon</span>
                      </span>
                    )}
                    {isOwner ? (
                      <span className="text-[9px] px-1.5 py-0.2 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-bold rounded-full border border-stone-200 dark:border-zinc-700">
                        E&#39;lon egasi (Siz)
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium opacity-0 group-hover/owner:opacity-100 transition-opacity">
                        Profil &rarr;
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                    {!book.ownerContact || book.ownerContact.includes('@') ? 'Toshkent shahri' : book.ownerContact}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hyper-local Location & Interactive Mini Yandex Map */}
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-stone-50/60 dark:bg-zinc-950/60 border border-stone-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Kitobni qayerdan olib ketish mumkin?
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="break-words">{addressText}</span>
              </div>
            </div>

            {distanceKm !== null && (
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-zinc-800 text-[10px] font-semibold text-stone-700 dark:text-stone-300 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Sizdan {formatDistance(distanceKm)}</span>
              </span>
            )}
          </div>

          {/* Interactive Mini Yandex Map (height: 180px) */}
          <div className="rounded-xl overflow-hidden border border-stone-200/90 dark:border-zinc-800 shadow-xs">
            <YandexMapPicker
              initialCoordinates={{ lat: bookLat, lng: bookLng }}
              onCoordinatesChange={() => {}}
              readOnly={true}
              height="180px"
              showSearchAndDistricts={false}
              userCoordinates={effectiveUserCoords}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <p className="text-[11px] text-stone-500 dark:text-zinc-400">
              Uchrashuv joyida kitobni koʻrib, oʻzaro kelishib olishingiz mumkin.
            </p>

            <a
              id="modal-yandex-route-btn"
              href={yandexRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Yandex Xaritada yo&#39;nalish</span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Swap terms & Return condition note */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span>Kelishuv sharti</span>
            <span className="text-[10px] font-semibold">
              {termType === 'gift' ? 'Hadya qilinadi' : termType === 'temporary' ? "Vaqtincha o'qishga" : 'Doimiy almashish'}
            </span>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-snug">
            {termType === 'gift'
              ? 'Ushbu kitob bepul hadya qilinadi.'
              : termType === 'temporary'
              ? "Belgilangan muddatda o'qib bo'lgach, kitobni egasiga butun holatda qaytarish lozim."
              : 'Kitob boshqa bir kitobga doimiy almashtiriladi, qaytarish talab etilmaydi.'}
          </p>

          {book.swapTerm?.returnConditionNote && (
            <div className="mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
              Egasi izohi: &ldquo;{book.swapTerm.returnConditionNote}&rdquo;
            </div>
          )}
        </div>

        {/* Description */}
        {book.description && (
          <div className="mt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-1.5">
              Kitob haqida
            </h4>
            <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed bg-stone-50/60 dark:bg-zinc-950/60 p-3.5 rounded-xl border border-stone-200/70 dark:border-zinc-800">
              {book.description}
            </p>
          </div>
        )}

        {/* Owner Management Controls */}
        {isOwner && (
          <div className="mt-5 p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex flex-col gap-2.5">
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
              <span>E&#39;lonni boshqarish</span>
              {onToggleComplete && (
                <button
                  type="button"
                  onClick={() => onToggleComplete(book.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors border ${
                    isInactive
                      ? 'bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                  }`}
                  title="Kitob holatini o'zgartirish"
                >
                  {getActionLabel()}
                </button>
              )}
            </div>

            {onOpenQRModal && (
              <button
                type="button"
                onClick={() => onOpenQRModal(book, isTemporarilyGiven ? 'return' : 'handover')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/25 text-xs font-bold transition-all shadow-xs"
              >
                <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>
                  {isTemporarilyGiven
                    ? 'QR-kod bilan qabul qilish'
                    : 'QR-kod bilan topshirish'}
                </span>
              </button>
            )}

            {onDeleteBook && (
              <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs text-red-700 hover:text-red-900 dark:text-red-400 border border-transparent flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>O&#39;chirish</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <span className="text-[11px] text-red-700 dark:text-red-400 font-semibold">Rostdan ham o&#39;chirasizmi?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDeleteBook(book.id)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold"
                      >
                        Ha, o&#39;chirish
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-200"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Primary CTA Buttons */}
        <div className="mt-6 pt-2">
          {!isOwner ? (
            <div className="flex flex-col sm:flex-row gap-2.5">
              {isGift ? (
                <button
                  id="modal-claim-gift-btn"
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal("Kitobni bepul qabul qilish uchun profilingizga kiring");
                      return;
                    }
                    handleMessageClick();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-tactile transition-all active:scale-[0.99]"
                >
                  <Gift className="w-4 h-4 text-white" />
                  <span>Kitobni bepul olish</span>
                </button>
              ) : isTemporary ? (
                <button
                  id="modal-borrow-request-btn"
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal("Vaqtincha o'qishga olish uchun profilingizga kiring");
                      return;
                    }
                    if (onOpenSwapModal) {
                      onOpenSwapModal(book);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm shadow-tactile transition-all active:scale-[0.99]"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>O&#39;qishga so&#39;rash</span>
                </button>
              ) : (
                <button
                  id="modal-swap-request-btn"
                  type="button"
                  onClick={() => {
                    if (!user) {
                      openAuthModal("Kitob almashish uchun profilingizga kiring");
                      return;
                    }
                    if (onOpenSwapModal) {
                      onOpenSwapModal(book);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm shadow-tactile transition-all active:scale-[0.99]"
                >
                  <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                  <span>Kitob almashish</span>
                </button>
              )}

              <button
                id="modal-send-message-btn"
                type="button"
                onClick={handleMessageClick}
                className="sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 font-semibold text-xs sm:text-sm transition-all"
                title="Kitob egasiga to'g'ridan-to'g'ri xabar yozish"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Xabar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onGoToMyListings) onGoToMyListings();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200/90 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-all"
            >
              Bu sizning e&#39;loningiz (Boshqarish)
            </button>
          )}
        </div>

      </div>

      {/* Fullscreen / Uncropped Inspection Lightbox */}
      {isPhotoZoomed && isRealPhoto && !imageError && (
        <div
          id="book-photo-lightbox"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Haqiqiy fotosurat</span>
                </span>
                <span className="text-xs text-stone-300 font-serif truncate max-w-[180px] sm:max-w-md">
                  {book.title} — {book.author}
                </span>
              </div>
              <button
                id="close-lightbox-btn"
                onClick={() => setIsPhotoZoomed(false)}
                className="p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-900/80 p-2 max-h-[78vh] flex items-center justify-center">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="max-h-[74vh] max-w-full w-auto h-auto object-contain rounded-xl select-none"
              />
            </div>

            <p className="text-[11px] text-stone-400 mt-2.5 text-center">
              Kitobning haqiqiy jismoniy holati va sahifalarini tekshirish uchun to&apos;liq ko&apos;rinish
            </p>
          </div>
        </div>
      )}

      {/* Dedicated Share Sheet / Modal */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Kitobni ulashish
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Book preview pill */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700/60">
              <div className="w-10 h-14 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                  {book.title}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                  {book.author}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  {book.swapTerm?.durationLabel || durationLabel}
                </div>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2">
              {/* Telegram 1-Click Share */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(`"${book.title}" (${book.author}) — Kitto.uz orqali kitob almashing!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-bold text-xs shadow-tactile transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Telegram orqali yuborish</span>
              </a>

              {/* WhatsApp 1-Click Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`"${book.title}" (${book.author}) — Kitto.uz orqali ko'rish: ${getShareUrl()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs shadow-xs transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp orqali yuborish</span>
              </a>
            </div>

            {/* Copy Link Input */}
            <div>
              <div className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 mb-1.5">
                Toʻgʻridan-toʻgʻri havola
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-800/80">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 bg-transparent px-2 text-xs text-stone-700 dark:text-stone-300 outline-none select-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                      <span>Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxa olish</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Native system share fallback */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2 text-center text-xs text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-stone-200 font-medium transition-colors"
              >
                Boshqa ilovalar orqali ulashish...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
