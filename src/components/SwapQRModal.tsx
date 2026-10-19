'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, ShieldCheck, Copy, Check, Clock, BookOpen } from 'lucide-react';
import { Book } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface SwapQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  mode?: 'handover' | 'return'; // 'handover': Kitob topshirish, 'return': Kitobni qaytarib olish
  onConfirmSuccess: (bookId: string, newStatus: 'temporarily_given' | 'swapped' | 'active') => void;
}

export const SwapQRModal: React.FC<SwapQRModalProps> = ({
  isOpen,
  onClose,
  book,
  mode = 'handover',
  onConfirmSuccess,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (!isOpen || !book) return null;

  // Generate deterministic 6-digit verification code based on book ID
  const shortCode = `KITTO-${(
    (book.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 97) % 9000 + 1000
  )}`;

  const verificationUrl = `https://kitto-fakv.vercel.app/?verify_swap=${encodeURIComponent(book.id)}&code=${shortCode}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    verificationUrl
  )}`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(shortCode);
    setCopied(true);
    showToast('Tasdiqlash kodi nusxalandi ✓', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    try {
      // Award +1 trust score / karma
      const currentTrust = user?.trustScore || 0;
      const newTrust = currentTrust + 1;
      const isTrustedNow = newTrust >= 3;

      updateProfile({
        trustScore: newTrust,
        isTrusted: isTrustedNow,
        completedSwaps: (user?.completedSwaps || 0) + 1,
      });

      let targetStatus: 'temporarily_given' | 'swapped' | 'active' = 'swapped';
      if (mode === 'handover') {
        targetStatus = book.swapTerm?.type === 'temporary' ? 'temporarily_given' : 'swapped';
        showToast(`🎉 Kitob topshirildi! Profilingizga +1 ishonch bali qoʻshildi (Jami: ${newTrust})`, 'success');
      } else {
        targetStatus = 'active';
        showToast(`🎉 Kitob toza va oʻz vaqtida qabul qilindi! +1 ishonch bali qoʻshildi (Jami: ${newTrust})`, 'success');
      }

      onConfirmSuccess(book.id, targetStatus);
      onClose();
    } catch {
      showToast('Xatolik yuz berdi, qaytadan urinib koʻring', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTemporary = book.swapTerm?.type === 'temporary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/65 backdrop-blur-md modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-1">
          <div className="w-13 h-13 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shadow-xs">
            <QrCode className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {mode === 'handover' ? 'Kitobni topshirish (QR-kod)' : 'Kitobni qabul qilish'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {mode === 'handover'
              ? 'Uchrashganda oluvchiga ushbu QR-kodni koʻrsating yoki tasdiqlash kodidan foydalaning.'
              : 'Kitob toza va oʻz vaqtida qaytarilganda «Qabul qilindi» deb tasdiqlang.'}
          </p>
        </div>

        {/* Book Mini Card */}
        <div className="mt-4 p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700/60 flex items-center gap-3">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-10 h-14 object-cover rounded-lg border border-stone-200 dark:border-zinc-700 shrink-0"
            />
          ) : (
            <div className="w-10 h-14 rounded-lg bg-stone-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-stone-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
              {book.title}
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">{book.author}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              <Clock className="w-3 h-3" />
              <span>{book.swapTerm?.durationLabel || 'Almashuv'}</span>
            </div>
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="mt-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 shadow-inner">
          <div className="relative p-2 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <img
              src={qrImageUrl}
              alt="Kitto Handover QR Code"
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
              loading="eager"
            />
          </div>

          {/* Verification Code Pill */}
          <div className="mt-3.5 flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono font-bold text-sm text-stone-900 dark:text-stone-100 tracking-wider">
              {shortCode}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors"
              title="Kodni nusxalash"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">
            Skanerlash imkoni boʻlmasa, ushbu kod orqali tasdiqlang
          </span>
        </div>

        {/* Trust Score Bonus Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">
              Tasdiqlangach profilingizga <b>+1 ishonch bali</b> beriladi
            </span>
          </div>
          <span className="font-bold font-serif text-sm px-2 py-0.5 rounded-full bg-amber-500 text-white shrink-0">
            +1 Ball
          </span>
        </div>

        {/* Confirmation Button */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmAction}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-bold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>
              {mode === 'handover'
                ? isTemporary
                  ? 'Kitob topshirildi deb tasdiqlash ✓'
                  : 'Kitob almashildi deb tasdiqlash ✓'
                : 'Kitob toza qaytarildi deb tasdiqlash ✓'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
