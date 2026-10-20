'use client';

import React, { useEffect } from 'react';
import { X, Phone, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { SUPPORT_PHONE, SUPPORT_TELEGRAM } from '@/lib/telegram-admin';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-md modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 modal-container-animate"
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shadow-xs">
            <MessageCircle className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Savol yoki taklifingiz bormi?
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Kitto bo&#39;yicha savol yoki takliflaringiz bo&#39;lsa, biz bilan bog&#39;laning.
          </p>
        </div>


        {/* Contact Cards */}
        <div className="mt-6 space-y-3">
          {/* Telegram Support Card */}
          <a
            href={`https://t.me/${SUPPORT_TELEGRAM}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-sky-50/70 hover:bg-sky-100/80 dark:bg-sky-950/30 dark:hover:bg-sky-950/50 border border-sky-200/90 dark:border-sky-800/60 transition-all group active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-sky-800 dark:text-sky-300">
                  Telegram orqali yozish
                </div>
                <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  @{SUPPORT_TELEGRAM}
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-sky-600 group-hover:bg-sky-700 text-white text-xs font-semibold shadow-xs">
              Yozish
            </span>
          </a>

          {/* Phone Call Card */}
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/90 dark:border-emerald-800/60 transition-all group active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
                  Telefon orqali bogʻlanish
                </div>
                <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  {SUPPORT_PHONE}
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs">
              Qoʻngʻiroq
            </span>
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800 text-center">
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Qoʻllab-quvvatlash xizmati har doim aloqada</span>
          </p>
        </div>
      </div>
    </div>
  );
};
