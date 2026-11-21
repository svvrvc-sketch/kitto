'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Sparkles, Navigation, Compass, Crosshair } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface RegionItem {
  id: string;
  name: string;
}

export const REGIONS: RegionItem[] = [
  { id: 'tashkent', name: 'Toshkent shahri' },
  { id: 'samarkand', name: 'Samarqand' },
  { id: 'bukhara', name: 'Buxoro' },
  { id: 'fergana', name: 'Farg\'ona' },
  { id: 'andijan', name: 'Andijon' },
  { id: 'namangan', name: 'Namangan' },
  { id: 'qashqadaryo', name: 'Qashqadaryo (Qarshi)' },
  { id: 'surxondaryo', name: 'Surxondaryo (Termiz)' },
  { id: 'khorezm', name: 'Xorazm (Urganch)' },
  { id: 'navoiy', name: 'Navoiy' },
  { id: 'jizzax', name: 'Jizzax' },
  { id: 'sirdaryo', name: 'Sirdaryo (Guliston)' },
  { id: 'qoraqalpogiston', name: 'Qoraqalpog\'iston (Nukus)' },
];

export const STORAGE_USER_VOTED_KEY = 'kitto_user_voted_region';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  isOutsideTashkent?: boolean;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [detectedDistrict, setDetectedDistrict] = useState<string | null>(null);

  const currentActiveCity = selectedCity || user?.city || 'O‘zbekiston';

  // Close on Escape key
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

  const handleAutoDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('Brauzeringizda GPS geolokatsiya qoʻllab-quvvatlanmaydi', 'error');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        try {
          sessionStorage.setItem('kitto_user_coords', JSON.stringify({ lat: latitude, lng: longitude }));
        } catch {
          // ignore
        }
        showToast('Joylashuvingiz aniqlandi!', 'success');
        onClose();
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          showToast('Brauzerda joylashuvga ruxsat berilmadi', 'error');
        } else {
          showToast('GPS orqali aniqlab bo‘lmadi. Hududni ro‘yxatdan tanlang.', 'info');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSelectRegion = (regionName: string) => {
    if (user && updateProfile) {
      updateProfile({ city: regionName });
    }
    if (onSelectCity) {
      onSelectCity(regionName);
    }
    showToast(`${regionName} hududi tanlandi`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#141615] border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 transition-all transform animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200/60 dark:border-zinc-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>O‘zbekiston hududlari</span>
            </div>
            <h2 className="font-sans text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Hududni tanlash
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Kitto butun O‘zbekiston bo‘ylab faol. O‘zingizga eng yaqin hududni tanlang.
            </p>
          </div>
          <button
            id="close-city-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Auto-Detection */}
        <div className="mt-3 shrink-0">
          <button
            id="modal-gps-auto-detect-btn"
            type="button"
            onClick={handleAutoDetectGPS}
            disabled={isLocating}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <p className="leading-tight font-bold">
                  {isLocating ? 'Joylashuvingiz aniqlanmoqda...' : 'Hozirgi joylashuvimni aniqlash'}
                </p>
                <p className="text-[10px] text-amber-100 font-normal">
                  GPS orqali eng yaqin kitoblarni saralash
                </p>
              </div>
            </div>
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Regions List */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 px-1 mb-1">
            Barcha viloyatlar va shaharlar
          </div>

          {REGIONS.map((region) => {
            const isSelected = currentActiveCity.includes(region.name) || (region.id === 'tashkent' && currentActiveCity.includes('Toshkent'));

            return (
              <div
                key={region.id}
                onClick={() => handleSelectRegion(region.name)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-stone-900 dark:text-stone-50 font-bold'
                    : 'bg-stone-50/50 dark:bg-zinc-900/60 border-stone-200/70 dark:border-zinc-800/80 hover:border-amber-500/40 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-amber-500 text-white' : 'bg-stone-200/70 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400'
                  }`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs truncate">{region.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Faol
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CitySelectorModal;
