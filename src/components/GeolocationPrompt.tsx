'use client';

import React, { useState } from 'react';
import { Navigation, X, Compass, Check } from 'lucide-react';

interface GeolocationPromptProps {
  isOpen: boolean;
  onAllow: (coords: { lat: number; lng: number }) => void;
  onSkip: () => void;
}

export const GeolocationPrompt: React.FC<GeolocationPromptProps> = ({
  isOpen,
  onAllow,
  onSkip,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleRequestLocation = () => {
    setIsRequesting(true);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsRequesting(false);
          onAllow({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setIsRequesting(false);
          onSkip();
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      setIsRequesting(false);
      onSkip();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/80 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 transition-all transform animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
          title="Keyinroq"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative w-14 h-14 rounded-2xl bg-[#141413] text-[#F8F7F4] dark:bg-stone-100 dark:text-[#141413] flex items-center justify-center mx-auto mb-3.5 shadow-tactile">
          <Navigation className="w-6 h-6 text-amber-500" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900" />
        </div>

        <div className="text-center">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Kitto sizga eng yaqin kitoblarni ko&#39;rsatishi uchun joylashuvingizni ulashing
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Kitob egalari bilan uchrashuv masofasini aniq bilish uchun lokatsiyangizdan foydalanishga ruxsat bering.
          </p>
        </div>

        <div className="my-4 py-2.5 px-3.5 rounded-2xl bg-stone-50/70 dark:bg-zinc-800/80 border border-stone-200/70 dark:border-zinc-700 space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.5]" />
            <span>Eng yaqin kitoblar birinchi koʻrsatiladi</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.5]" />
            <span>📍 Masofa hisoblanadi (masalan: 1.4 km uzoqlikda)</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            id="geo-allow-btn"
            type="button"
            disabled={isRequesting}
            onClick={handleRequestLocation}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs shadow-tactile transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <Compass className="w-4 h-4" />
            <span>{isRequesting ? 'Aniqlanmoqda...' : 'Ruxsat berish'}</span>
          </button>

          <button
            id="geo-skip-btn"
            type="button"
            onClick={onSkip}
            className="w-full py-2.5 px-4 rounded-xl text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium text-xs transition-colors"
          >
            Keyinroq
          </button>
        </div>
      </div>
    </div>
  );
};
