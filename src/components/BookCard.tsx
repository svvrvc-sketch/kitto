'use client';

import React, { useState, useEffect } from 'react';
import { Book } from '@/types/book';
import { Bookmark, CheckCircle2, Trash2, RefreshCw, MapPin, BookOpen, Camera, Clock, ShieldCheck, QrCode, ArrowLeftRight, Gift } from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '@/lib/geo-utils';
import { formatBookCondition } from '@/lib/book-constants';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  onToggleSave?: (bookId: string, e: React.MouseEvent) => void;
  isSaved?: boolean;
  isMyListing?: boolean;
  onToggleStatus?: (bookId: string, e: React.MouseEvent) => void;
  onDeleteBook?: (bookId: string, e: React.MouseEvent) => void;
  userCoordinates?: { lat: number; lng: number } | null;
  onOpenUserProfile?: (userId: string, e: React.MouseEvent) => void;
  onOpenQRModal?: (book: Book, mode: 'handover' | 'return') => void;
  onOpenSwapModal?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onClick,
  onToggleSave,
  isSaved = false,
  isMyListing = false,
  onToggleStatus,
  onDeleteBook,
  userCoordinates = null,
  onOpenUserProfile,
  onOpenQRModal,
  onOpenSwapModal,
}) => {
  const [imageError, setImageError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Check if book has a real uploaded photo (not legacy unsplash stock)
  const isRealPhoto = Boolean(
    book.coverUrl &&
    !book.coverUrl.includes('unsplash.com') &&
    (book.coverUrl.startsWith('data:image/') || book.coverUrl.startsWith('http'))
  );
  const [effectiveCoords, setEffectiveCoords] = useState<{ lat: number; lng: number } | null>(
    userCoordinates || null
  );

  useEffect(() => {
    if (userCoordinates) {
      setEffectiveCoords(userCoordinates);
    } else {
      try {
        const stored = sessionStorage.getItem('kitto_user_coords') || sessionStorage.getItem('bookswap_user_coords');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.lat === 'number') {
            setEffectiveCoords(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [userCoordinates]);

  const bookLat = book.location?.lat ?? book.coordinates?.lat;
  const bookLng = book.location?.lng ?? book.coordinates?.lng;

  const distanceKm =
    effectiveCoords && bookLat !== undefined && bookLng !== undefined
      ? calculateDistanceKm(effectiveCoords.lat, effectiveCoords.lng, bookLat, bookLng)
      : null;

  const address = book.location?.addressText || book.exactLocation || 'Toshkent shahri';
  const isSwapped = book.status === 'swapped' || Boolean(book.isCompleted);

  const isTemporary = book.swapTerm?.type === 'temporary';
  const isGift = book.swapTerm?.type === 'gift' || book.type === 'gift';
  const isTemporarilyGiven = book.status === 'temporarily_given';

  const getActionLabel = () => {
    if (isGift) {
      return isSwapped ? 'Mavjud' : 'Topshirildi';
    }
    if (isTemporary) {
      return isTemporarilyGiven ? 'Faollashtirish' : "O'qilmoqda";
    }
    return isSwapped ? 'Almashishga tayyor' : 'Band qilish';
  };

  const isInactive = isSwapped || isTemporarilyGiven;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDeleteBook) {
      onDeleteBook(book.id, e);
    }
    setConfirmDelete(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  const handleToggleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleStatus) {
      onToggleStatus(book.id, e);
    }
  };

  const getReturnDateLabel = () => {
    if (book.loanInfo?.dueAt) {
      try {
        const d = new Date(book.loanInfo.dueAt);
        return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
      } catch {
        return '25-oktabr';
      }
    }
    try {
      const base = new Date(book.createdAt || Date.now());
      base.setDate(base.getDate() + 14);
      return base.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
    } catch {
      return '25-oktabr';
    }
  };

  // Explicit Book Status Badges
  const renderSwapBadge = () => {
    const isTemporarilyGiven = book.status === 'temporarily_given';
    const isReserved = book.status === 'reserved';
    const isSwapped = book.status === 'swapped' || Boolean(book.isCompleted);
    const termType = book.swapTerm?.type || (book.type === 'gift' ? 'gift' : 'permanent');

    if (isTemporarilyGiven) {
      const returnDate = getReturnDateLabel();
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg backdrop-blur-sm shadow-xs border border-amber-400">
          <Clock className="w-3 h-3" />
          <span>O&apos;qilmoqda • {returnDate} gacha</span>
        </span>
      );
    }

    if (isReserved) {
      return (
        <span className="inline-flex items-center gap-1 bg-stone-700 text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm shadow-xs">
          <CheckCircle2 className="w-3 h-3" />
          <span>Band qilingan</span>
        </span>
      );
    }

    if (isSwapped) {
      return (
        <span className="inline-flex items-center gap-1 bg-stone-700 text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm shadow-xs">
          <CheckCircle2 className="w-3 h-3" />
          <span>Almashilgan</span>
        </span>
      );
    }

    if (termType === 'gift') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm shadow-xs">
          <span>Hadya qilinadi</span>
        </span>
      );
    }

    if (termType === 'temporary') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm shadow-xs">
          <span>Vaqtincha o&apos;qishga</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
        <span>Almashishga tayyor</span>
      </span>
    );
  };


  return (
    <article
      onClick={() => onClick(book)}
      className={`group relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-stone-200/90 dark:border-zinc-800 shadow-book hover:shadow-book-hover card-hover-lift cursor-pointer ${
        isInactive ? 'opacity-85' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 dark:bg-zinc-950 book-spine-effect before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-gradient-to-r before:from-black/25 before:to-transparent before:z-10 before:pointer-events-none">
        {isRealPhoto && !imageError ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          /* Editorial Typographic Book Cover (Legacy fallback — never stock coffee photos) */
          <div className="flex h-full w-full flex-col justify-between bg-stone-100 dark:bg-zinc-850 dark:bg-zinc-900 p-4 border-l-2 border-stone-300 dark:border-zinc-700 select-none">
            <div className="flex items-center justify-between opacity-60">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-700 dark:text-stone-300">
                Kitto
              </span>
              <BookOpen className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
            </div>
            <div className="my-auto py-2">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-3 leading-snug">
                {book.title}
              </h4>
              <p className="font-serif italic text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-1">
                {book.author}
              </p>
            </div>
            <div className="pt-2 border-t border-stone-300/60 dark:border-zinc-700/60 flex items-center justify-between text-[9px] text-stone-500 dark:text-zinc-400">
              <span className="uppercase tracking-wider truncate max-w-[90px]">{book.category || 'Kitob'}</span>
              <span>{formatBookCondition(book.condition)}</span>
            </div>
          </div>
        )}

        {/* Status Overlays: Vaqtincha berilgan or Almashildi */}
        {isTemporarilyGiven ? (
          <div className="absolute inset-0 bg-stone-950/45 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none p-2 text-center">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-serif font-semibold tracking-wide shadow-md flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>O&apos;qilmoqda • {getReturnDateLabel()} gacha</span>
            </span>
          </div>
        ) : isSwapped ? (
          <div className="absolute inset-0 bg-stone-950/45 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 text-xs font-serif font-semibold tracking-wide shadow-md flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 dark:text-zinc-400" />
              {isGift ? 'Topshirildi' : 'Almashilgan'}
            </span>
          </div>
        ) : null}


        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none z-20">
          {renderSwapBadge()}

          {/* Bookmark Button */}
          {onToggleSave && (
            <button
              id={`save-btn-${book.id}`}
              type="button"
              onClick={(e) => onToggleSave(book.id, e)}
              className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 border ${
                isSaved
                  ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                  : 'bg-black/40 hover:bg-black/60 dark:bg-black/50 text-white border-white/10'
              }`}
              title={isSaved ? "Saqlanganlardan chiqarish" : "Saqlash"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          )}
        </div>

        {/* Proximity Distance Badge */}
        {distanceKm !== null && (
          <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 border border-black/20 dark:border-white/10 bg-[#141413]/85 text-[#F8F7F4] dark:bg-zinc-800/90 dark:text-stone-100 text-[9px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-xs">
              <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span>{formatDistance(distanceKm)} uzoqlikda</span>
            </span>
          </div>
        )}

        {/* Condition & Authentic Photo Micro-indicator */}
        <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none flex items-center gap-1">
          {isRealPhoto && !imageError && (
            <span className="inline-flex items-center gap-1 border border-stone-200/60 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-stone-800 dark:text-stone-200 text-[9px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm shadow-xs">
              <Camera className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>Haqiqiy</span>
            </span>
          )}
          <span className="inline-block border border-stone-200/60 dark:border-zinc-700 bg-white/85 dark:bg-zinc-800/90 text-stone-700 dark:text-stone-200 text-[10px] tracking-wider font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
            {formatBookCondition(book.condition)}
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors tracking-tight leading-snug">
          {book.title || 'Nomsiz kitob'}
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
          {book.author || 'Muallif ko‘rsatilmagan'}
        </p>

        {/* Human-readable Address Text & Distance */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 min-w-0 flex-1 mr-2 text-stone-600 dark:text-stone-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              {distanceKm !== null
                ? `Sizdan ${formatDistance(distanceKm)} • ${address}`
                : address}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id={`book-owner-${book.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenUserProfile) {
                  onOpenUserProfile(book.ownerId, e);
                }
              }}
              className="text-[10px] text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100 hover:underline shrink-0 transition-colors font-medium"
              title="Kitobxon profilini ko'rish"
            >
              {book.ownerName || 'Kitob egasi'}
            </button>
            {(book.ownerIsTrusted || (book.ownerTrustScore && book.ownerTrustScore >= 3)) && (
              <span
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[9px] font-bold border border-amber-500/20"
                title="Ishonchli kitobxon (Tasdiqlangan bitimlar)"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-amber-500" />
                <span>Ishonchli</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls for Non-My Listing Cards (Feed View) */}
        {!isMyListing && onOpenSwapModal && (
          <div className="mt-3 pt-2.5 border-t border-stone-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 dark:text-amber-300 truncate">
              {book.swapTerm?.durationLabel || 'Almashuv'}
            </span>
            {isGift ? (
              <button
                type="button"
                id={`book-gift-btn-${book.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(book);
                }}
                className="py-1 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95 shrink-0"
                title="Kitobni bepul qabul qilish"
              >
                <Gift className="w-3 h-3 text-white" />
                <span>Kitobni olish</span>
              </button>
            ) : isTemporary ? (
              <button
                type="button"
                id={`book-borrow-btn-${book.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(book);
                }}
                className="py-1 px-2.5 rounded-xl bg-[#141413] hover:bg-black dark:bg-stone-200 dark:hover:bg-white text-white dark:text-stone-900 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95 shrink-0"
                title="Vaqtincha o'qishga olish"
              >
                <Clock className="w-3 h-3 text-amber-500" />
                <span>O&#39;qishga olish</span>
              </button>
            ) : (
              <button
                type="button"
                id={`book-swap-btn-${book.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSwapModal(book);
                }}
                className="py-1 px-2.5 rounded-xl bg-[#141413] hover:bg-black dark:bg-stone-200 dark:hover:bg-white text-white dark:text-stone-900 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95 shrink-0"
                title="Kitob almashish taklifini yuborish"
              >
                <ArrowLeftRight className="w-3 h-3 text-amber-500" />
                <span>Almashish</span>
              </button>
            )}
          </div>
        )}

        {/* Action Controls for "E'lonlar" View */}
        {isMyListing && (
          <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-zinc-800 flex flex-col gap-2">
            {!confirmDelete ? (
              <div className="flex items-center justify-between gap-1.5">
                {onOpenQRModal && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenQRModal(book, isTemporarilyGiven ? 'return' : 'handover');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/25 transition-all shadow-xs"
                    title="QR kod orqali topshirish yoki qabul qilish"
                  >
                    <QrCode className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>QR {isTemporarilyGiven ? 'Qabul qilish' : 'Topshirish'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleStatusClick}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold tracking-wide flex items-center justify-center gap-1 transition-all border ${
                    onOpenQRModal ? 'shrink-0' : 'flex-1'
                  } ${
                    isInactive
                      ? 'bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                  }`}
                  title="Kitob holatini o'zgartirish"
                >
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  <span>{getActionLabel()}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded-lg text-red-700 hover:text-red-900 dark:text-red-400 border border-transparent hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                  title="O'chirish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-800/90 border border-stone-300 dark:border-zinc-700 text-center animate-in fade-in duration-150"
              >
                <div className="text-[10px] text-red-700 dark:text-red-400 font-bold mb-1.5">
                  Rostdan ham o'chirasizmi?
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-2.5 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all"
                  >
                    Ha, o'chirish
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="px-2 py-1 rounded-md bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 text-[10px] hover:bg-stone-300 dark:hover:bg-zinc-600 transition-all"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </article>
  );
};
