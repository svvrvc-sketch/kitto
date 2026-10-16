'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Sparkles, TrendingUp, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { votesService } from '@/services/db';

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
export const STORAGE_CLEAN_VERSION_KEY = 'kitto_votes_clean_v2';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
}) => {
  const { showToast } = useToast();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedRegionId, setVotedRegionId] = useState<string | null>(null);

  // Load votes asynchronously from cloud / storage with realtime sync
  useEffect(() => {
    if (!isOpen) return;

    // Load user's vote from local state
    const storedUserVoted =
      localStorage.getItem(STORAGE_USER_VOTED_KEY) ||
      localStorage.getItem('bookswap_user_voted_region');
    setVotedRegionId(storedUserVoted || null);

    // Fetch latest votes from votesService
    votesService.getVotes().then((data) => {
      const merged: Record<string, number> = {};
      REGIONS.forEach((r) => {
        merged[r.id] = typeof data[r.id] === 'number' ? data[r.id] : 0;
      });
      setVotes(merged);
    }).catch((err) => {
      console.warn('Could not load votes:', err);
    });

    // Subscribe to realtime vote updates
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

  const handleVote = (regionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // STRICT SINGLE-VOTE LOGIC:
    if (votedRegionId) {
      if (votedRegionId === regionId) {
        showToast("Ovozingiz allaqachon ushbu hududga berilgan ✓", 'info');
      } else {
        showToast("Siz allaqachon o'z hududingizga ovoz bergansiz.", 'info');
      }
      return;
    }

    // Increment strictly from current count (0 to 1)
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
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Hududni tanlash
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed">
              Kitto hozirda <strong>Toshkent</strong> shahrida faol ishlamoqda. O&#39;z hududingizga ovoz bering — 100 ta ovoz to&#39;planganda Kitto sizning viloyatingizda ham ishga tushadi.
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

        {/* Section 1 — Faol hudud */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-zinc-400">
              Faol hudud
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Kitob almashuvi ochiq
            </span>
          </div>

          <div
            id="active-city-tashkent-card"
            onClick={handleSelectActiveCity}
            className="group relative flex items-center justify-between p-4 rounded-2xl bg-stone-50/60 dark:bg-zinc-800/80 border-2 border-[#141413] dark:border-amber-500/60 shadow-sm cursor-pointer hover:bg-amber-50/30 dark:hover:bg-zinc-800 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#141413] dark:bg-amber-500 text-[#F8F7F4] dark:text-[#141413] flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                    Toshkent shahri
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                    Faol
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                  Barcha tumanlar boʻylab kitoblar joylash va almashish
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#141413] dark:bg-amber-500 text-[#F8F7F4] dark:text-[#141413] flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>

        {/* Section 2 — Tez kunda ochiladigan hududlar (100 ovoz to'planganda ochiladi) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-zinc-400">
              Tez kunda ochiladigan hududlar
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              100 ovoz to&#39;planganda ochiladi
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {REGIONS.map((region) => {
              const currentVotes = votes[region.id] ?? 0;
              const hasVotedForThis = votedRegionId === region.id;
              const isLocked = Boolean(votedRegionId && !hasVotedForThis);
              const targetVotes = 100;
              const progressPercent = Math.min(Math.round((currentVotes / targetVotes) * 100), 100);

              return (
                <div
                  key={region.id}
                  id={`region-card-${region.id}`}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    hasVotedForThis
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700/80'
                      : 'bg-white dark:bg-zinc-800/70 border-stone-200/80 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 opacity-70" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                          {region.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                          {currentVotes} / {targetVotes} ovoz
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasVotedForThis ? (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ovozingiz berildi ✓</span>
                        </span>
                      ) : isLocked ? (
                        <button
                          type="button"
                          onClick={(e) => handleVote(region.id, e)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-400 text-xs font-medium border border-stone-200/70 dark:border-zinc-700 flex items-center gap-1 cursor-not-allowed"
                          title="Siz allaqachon o'z hududingizga ovoz bergansiz."
                        >
                          <Lock className="w-3 h-3" />
                          <span>Ovoz berish</span>
                        </button>
                      ) : (
                        <button
                          id={`vote-btn-${region.id}`}
                          type="button"
                          onClick={(e) => handleVote(region.id, e)}
                          className="px-3 py-1.5 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-semibold shadow-xs transition-all active:scale-95"
                        >
                          Ovoz berish
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar towards 100 votes */}
                  <div className="mt-2.5 w-full bg-stone-100 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hasVotedForThis ? 'bg-amber-500' : 'bg-amber-500/70'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-5 pt-3 border-t border-stone-100 dark:border-zinc-800 text-center">
          <p className="text-[11px] text-stone-400 dark:text-zinc-400">
            Hozircha kitob eʼlonlari faqat Toshkent shahri boʻyicha qabul qilinadi.
          </p>
        </div>
      </div>
    </div>
  );
};
