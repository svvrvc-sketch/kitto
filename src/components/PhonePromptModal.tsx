'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserCheck, ShieldCheck, X } from 'lucide-react';
import { isValidUzbekPhone, formatLocalPhone, getUzbekOperator } from '@/utils/phone';
import { UZBEKISTAN_REGIONS } from '@/lib/regions';
import { profilesService } from '@/services/db';

export const PhonePromptModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPhonePromptOpen,
    closePhonePrompt,
    updateProfile,
  } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('Toshkent shahri');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data from auth state or Google profile
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.contact && !user.contact.includes('@')) {
        const clean = user.contact.replace('+998', '').replace(/\s+/g, '');
        setPhoneInput(clean.substring(0, 9));
      } else {
        setPhoneInput('');
      }
      if (user.telegramUsername) {
        setTelegramUsername(user.telegramUsername.replace(/^@/, ''));
      }
      if (user.age) {
        setAge(String(user.age));
      }
      if (user.city) {
        setCity(user.city);
      }
    }
    setError('');
  }, [user, isPhonePromptOpen]);

  if (!isPhonePromptOpen || !isAuthenticated || !user) return null;

  const rawDigits = phoneInput.replace(/\D/g, '');
  const operator = getUzbekOperator(phoneInput);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d\s]/g, '');
    if (val.startsWith('998')) {
      val = val.substring(3);
    }
    const digitsOnly = val.replace(/\D/g, '').substring(0, 9);
    setPhoneInput(digitsOnly);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Iltimos, ism va familiyangizni kiriting');
      return;
    }

    if (!rawDigits || rawDigits.length !== 9) {
      setError('Iltimos, 9 xonali telefon raqamingizni toʻliq kiriting');
      return;
    }

    const fullPhone = `+998 ${rawDigits.substring(0, 2)} ${rawDigits.substring(2, 5)} ${rawDigits.substring(5, 7)} ${rawDigits.substring(7, 9)}`;
    if (!isValidUzbekPhone(fullPhone)) {
      setError('Notoʻgʻri Oʻzbekiston operator kodi (masalan: 90, 91, 93, 94, 97, 98, 99, 33, 88, 77, 50, 20)');
      return;
    }

    const cleanAge = age.trim() ? parseInt(age.trim(), 10) : undefined;
    if (cleanAge !== undefined && (isNaN(cleanAge) || cleanAge < 7 || cleanAge > 110)) {
      setError('Iltimos, haqiqiy yoshingizni kiriting');
      return;
    }

    const cleanTg = telegramUsername.trim()
      ? `@${telegramUsername.trim().replace(/^@/, '')}`
      : undefined;

    setIsSaving(true);
    setError('');

    try {
      const updatedProfile = {
        ...user,
        name: cleanName,
        contact: fullPhone,
        telegramUsername: cleanTg,
        age: cleanAge,
        city: city || 'Toshkent shahri',
      };

      // 1. Save to Supabase and LocalStorage
      await profilesService.upsertProfile(updatedProfile);

      // 2. Update AuthContext in-memory and storage
      updateProfile(updatedProfile);

      showToast('Profilingiz muvaffaqiyatli saqlandi!', 'success');
      closePhonePrompt();
    } catch (err) {
      console.error('Profile save error:', err);
      setError('Maʼlumotlarni saqlashda xatolik yuz berdi. Iltimos, qayta urinib koʻring.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xl p-6 sm:p-7 text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closePhonePrompt}
          className="absolute right-4 top-4 p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5 border border-amber-500/20">
            <UserCheck className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight">
            Profilingizni toʻldiring
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed max-w-sm">
            Kitto platformasida kitob almashish va boshqa kitobxonlar bilan bogʻlanish uchun maʼlumotlaringizni kiriting.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Ism va Familiya */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Ism va familiyangiz <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masalan: Zuxriddin Hasanov"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          {/* 2. Telefon Raqam */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Bogʻlanish uchun telefon raqam <span className="text-amber-500">*</span>
              </label>
              {operator && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {operator.name}
                </span>
              )}
            </div>
            <div className="flex items-center rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-500 overflow-hidden transition-all">
              <div className="px-3 py-2.5 bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 border-r border-stone-200 dark:border-stone-700 shrink-0">
                UZ +998
              </div>
              <input
                type="tel"
                value={formatLocalPhone(phoneInput)}
                onChange={handlePhoneChange}
                placeholder="90 123 45 67"
                maxLength={12}
                className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Telegram Username & Yoshi (Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Telegram username
              </label>
              <div className="flex items-center rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-500 overflow-hidden transition-all">
                <span className="pl-3 text-stone-400 font-bold text-xs select-none">@</span>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ''))}
                  placeholder="username"
                  className="w-full px-2 py-2.5 bg-transparent text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Yoshingiz
              </label>
              <input
                type="number"
                min={8}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Masalan: 21"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* 4. Shahar / Hudud */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Viloyat / Hududingiz
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all cursor-pointer"
            >
              {UZBEKISTAN_REGIONS.map((reg) => (
                <option key={reg.id} value={reg.name} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-2 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-pulse">Saqlanmoqda...</span>
            ) : (
              <span>Saqlash va davom etish</span>
            )}
          </button>

          {/* Security Notice */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Raqamingiz faqat tasdiqlangan almashuvlarda koʻrsatiladi</span>
          </div>
        </form>
      </div>
    </div>
  );
};
