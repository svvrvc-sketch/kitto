'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Sparkles, TrendingUp, Navigation, Compass, Crosshair } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { votesService } from '@/services/db';
import { getClosestTashkentDistrict, TASHKENT_CENTER } from './YandexMapPicker';

interface RegionWaitlist {
  id: string;
  name: string;
  baseVotes: number;
}

export const REGIONS: RegionWaitlist[] = [
  { id: 'qashqadaryo', name: 'Qashqadaryo (Qarshi)', baseVotes: 0 },
  { id: 'samarkand', name: 'Samarqand', baseVotes: 0 },
  { id: 'bukhara', name: 'Buxoro', baseVotes: 0 },
  { id: 'fergana', name: 'Farg\'ona', baseVotes: 0 },
  { id: 'andijan', name: 'Andijon', baseVotes: 0 },
  { id: 'namangan', name: 'Namangan', baseVotes: 0 },
  { id: 'khorezm', name: 'Xorazm', baseVotes: 0 },
  { id: 'surxondaryo', name: 'Surxondaryo', baseVotes: 0 },
  { id: 'navoiy', name: 'Navoiy', baseVotes: 0 },
  { id: 'jizzax', name: 'Jizzax', baseVotes: 0 },
  { id: 'sirdaryo', name: 'Sirdaryo', baseVotes: 0 },
  { id: 'qoraqalpogiston', name: 'Qoraqalpog\'iston', baseVotes: 0 },
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
  onSelectCity,
  isOutsideTashkent = false,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedRegionId, setVotedRegionId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [detectedDistrict, setDetectedDistrict] = useState<string | null>(null);

  // Load votes asynchronously from cloud / storage with realtime sync
  useEffect(() => {
    if (!isOpen) return;

    const storedUserVoted =
      localStorage.getItem(STORAGE_USER_VOTED_KEY) ||
      localStorage.getItem('bookswap_user_voted_region');
    setVotedRegionId(storedUserVoted || null);

    votesService.getVotes().then((data) => {
      const merged: Record<string, number> = {};
      REGIONS.forEach((r) => {
        merged[r.id] = typeof data[r.id] === 'number' ? data[r.id] : 0;
      });
      setVotes(merged);
    }).catch((err) => {
      console.warn('Could not load votes:', err);
    });

    const unsubscribe = votesService.subscribeToVotes((payload) => {
      if (payload.new && payload.new.region_id) {
        setVotes((prev) => ({
          ...prev,
          [payload.new.region_id]: Number(payload.new.votes_count) || 0,
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  // Auto-detect location via GPS
  const handleAutoDetectGPS = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      showToast('Brauzeringizda geolokatsiya mavjud emas', 'error');
      return;
    }

    setIsLocating(true);

    const onGeoSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const closestDistrict = getClosestTashkentDistrict(lat, lng);

      // Distance from Tashkent center in km
      const distFromCenterKm =
        Math.hypot(lat - TASHKENT_CENTER.lat, lng - TASHKENT_CENTER.lng) * 111;

      try {
        sessionStorage.setItem('kitto_user_coords', JSON.stringify({ lat, lng }));
        sessionStorage.setItem('bookswap_user_coords', JSON.stringify({ lat, lng }));
        localStorage.setItem('kitto_user_coords', JSON.stringify({ lat, lng }));
        window.dispatchEvent(
          new CustomEvent('kitto_coords_updated', { detail: { lat, lng } })
        );
      } catch {
        // ignore
      }

      setIsLocating(false);

      if (distFromCenterKm <= 50) {
        setDetectedDistrict(closestDistrict.name);
        if (user && updateProfile) {
          updateProfile({ city: 'Toshkent shahri' });
        }
        if (onSelectCity) onSelectCity('Toshkent');
        showToast(
          `Joylashuvingiz aniqlandi: Toshkent (${closestDistrict.name} tumani)!`,
          'success'
        );
        setTimeout(() => onClose(), 1200);
      } else {
        showToast(
          `Siz Toshkentdan ${Math.round(distFromCenterKm)} km masofadasiz. Viloyatingiz uchun ovoz bering!`,
          'info'
        );
      }
    };

    const onGeoError = () => {
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            showToast("Brauzerda joylashuvga ruxsat berilmadi", 'error');
          } else {
            showToast("GPS orqali aniqlab bo'lmadi. Toshkentni tanlashingiz mumkin.", 'info');
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError,
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleVote = (regionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const regObj = REGIONS.find((r) => r.id === regionId);
    if (regObj) {
      if (user && updateProfile) {
        updateProfile({ city: regObj.name });
      }
      if (onSelectCity) {
        onSelectCity(regObj.name);
      }
    }

    if (votedRegionId) {
      if (votedRegionId === regionId) {
        showToast("Ovozingiz allaqachon ushbu hududga berilgan", 'info');
      } else {
        showToast("Siz allaqachon o'z hududingizga ovoz bergansiz.", 'info');
      }
      return;
    }

    const currentCount = votes[regionId] || 0;
    const newVotes = {
      ...votes,
      [regionId]: currentCount + 1,
    };
    setVotes(newVotes);
    setVotedRegionId(regionId);

    votesService.voteRegion(regionId).catch((err) => {
      console.warn('Could not sync vote to cloud:', err);
    });

    showToast("Ovozingiz qabul qilindi! Hududingizda tez orada ishga tushamiz.", 'success');
  };

  const handleSelectActiveCity = () => {
    if (user && updateProfile) {
      updateProfile({ city: 'Toshkent shahri' });
    }
    if (onSelectCity) onSelectCity('Toshkent');
    showToast('Toshkent shahri tanlandi', 'info');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-md modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/80 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200/60 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-[0.16em] uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 mb-2">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Hududlar</span>
            </div>
            <h2 className="font-sans text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Hududni tanlash
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed">
              Kitto Toshkent shahrida toʻliq faoliyat yuritmoqda. Joylashuvingizni avtomatik aniqlashingiz mumkin.
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

        {/* 1. Fast GPS Auto-Detection Button */}
        <div className="mt-4">
          <button
            id="modal-gps-auto-detect-btn"
            type="button"
            onClick={handleAutoDetectGPS}
            disabled={isLocating}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <p className="leading-tight">
                  {isLocating ? 'Joylashuvingiz aniqlanmoqda...' : 'Hozirgi joylashuvimni aniqlash'}
                </p>
                <p className="text-[10px] text-amber-100 font-normal">
                  {detectedDistrict
                    ? `Aniqlangan: ${detectedDistrict} tumani`
                    : 'GPS orqali avtomatik topish'}
                </p>
              </div>
            </div>
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 2. Section 1 — Faol hudud (Toshkent shahri) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Faol hudud
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Kitob almashuvi ochiq
            </span>
          </div>

          <div
            id="active-city-tashkent-card"
            onClick={handleSelectActiveCity}
            className="group relative flex items-center justify-between p-4 rounded-2xl bg-stone-50/70 dark:bg-zinc-800/80 border-2 border-stone-900 dark:border-amber-500/60 shadow-sm cursor-pointer hover:bg-amber-50/30 dark:hover:bg-zinc-800 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-base text-stone-900 dark:text-stone-100">
                    Toshkent shahri
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                    Faol
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                  Barcha 12 ta tuman boʻylab kitoblar almashuvi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>

        {/* Section 2 — Viloyatlar uchun ovoz berish */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              Boshqa viloyatlar
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              100 ovozda ochiladi
            </span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {REGIONS.map((region) => {
              const count = votes[region.id] || 0;
              const hasVotedThis = votedRegionId === region.id;
              const pct = Math.min(100, Math.round((count / 100) * 100));

              return (
                <div
                  key={region.id}
                  onClick={(e) => handleVote(region.id, e)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    hasVotedThis
                      ? 'bg-amber-500/10 border-amber-500/40 text-stone-900 dark:text-stone-100'
                      : 'bg-stone-50/50 dark:bg-zinc-800/40 border-stone-200/70 dark:border-zinc-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {region.name}
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        {count} ovoz
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-zinc-700 mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleVote(region.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                      hasVotedThis
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {hasVotedThis ? 'Ovoz berildi' : 'Ovoz berish'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySelectorModal;
