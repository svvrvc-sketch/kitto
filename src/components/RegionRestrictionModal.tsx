'use client';

import React from 'react';
import { X, MapPin, MapPinOff, Vote, ArrowRight, ShieldAlert } from 'lucide-react';
import { calculateDistanceKm, TASHKENT_CENTER_COORDS } from '@/lib/geo-utils';

interface RegionRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoting: () => void;
  userCoordinates?: { lat: number; lng: number } | null;
}

export const RegionRestrictionModal: React.FC<RegionRestrictionModalProps> = ({
  isOpen,
  onClose,
  onOpenVoting,
  userCoordinates,
}) => {
  if (!isOpen) return null;

  const distanceKm = userCoordinates
    ? Math.round(
        calculateDistanceKm(
          userCoordinates.lat,
          userCoordinates.lng,
          TASHKENT_CENTER_COORDS.lat,
          TASHKENT_CENTER_COORDS.lng
        )
      )
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-6 transition-all transform animate-in slide-in-from-bottom-4 duration-200"
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

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <MapPinOff className="w-8 h-8 stroke-[1.75]" />
            <span className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white">
              <ShieldAlert className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Title & Info */}
        <div className="text-center">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Kitto hozircha faqat Toshkent shahrida ishlamoqda
          </h3>
          {distanceKm && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-semibold mt-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Joylashuvingiz Toshkentdan {distanceKm} km uzoqlikda</span>
            </div>
          )}
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-sans leading-relaxed mt-3">
            Siz katalogdagi kitoblarni ko&#39;rishingiz mumkin. Tez orada viloyatingizda ham ishga tushishimiz uchun ovoz bering.
          </p>
        </div>

        {/* Voting Promotion Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Vote className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold text-stone-900 dark:text-stone-100">
                O&#39;z viloyatingiz uchun ovoz bering
              </div>
              <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                Ko&#39;p ovoz to&#39;plagan viloyatda xizmat birinchi bo&#39;lib ishga tushadi!
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenVoting();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.99]"
          >
            <Vote className="w-4 h-4" />
            <span>Viloyat uchun ovoz berish</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium text-xs transition-colors"
          >
            Tushunarli, kitoblarni koʻrish
          </button>
        </div>
      </div>
    </div>
  );
};
