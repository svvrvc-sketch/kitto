'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Phone, Sparkles, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { isValidUzbekPhone, formatUzbekPhone, getUzbekOperator } from '@/utils/phone';

export const PhonePromptModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPhonePromptOpen,
    phonePromptReason,
    closePhonePrompt,
    savePhoneNumber,
  } = useAuth();
  const { showToast } = useToast();

  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user already has a partial phone or valid phone, pre-fill
  useEffect(() => {
    if (user?.contact && !user.contact.includes('@')) {
      setPhoneInput(user.contact.replace('+998', '').trim());
    } else {
      setPhoneInput('');
    }
    setError('');
  }, [user, isPhonePromptOpen]);

  if (!isPhonePromptOpen || !isAuthenticated) return null;

  const rawDigits = phoneInput.replace(/\D/g, '');
  const operator = getUzbekOperator(phoneInput);
  const isValid = isValidUzbekPhone('+998' + rawDigits);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d\s]/g, '');
    if (val.startsWith('998')) {
      val = val.substring(3);
    }
    // Limit to 9 digits
    const digitsOnly = val.replace(/\D/g, '').substring(0, 9);
    setPhoneInput(digitsOnly);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDigits || rawDigits.length !== 9) {
      setError('Iltimos, 9 xonali telefon raqamingizni toʻliq kiriting');
      return;
    }

    const fullPhone = `+998 ${rawDigits.substring(0, 2)} ${rawDigits.substring(2, 5)} ${rawDigits.substring(5, 7)} ${rawDigits.substring(7, 9)}`;

    if (!isValidUzbekPhone(fullPhone)) {
      setError('Notoʻgʻri Oʻzbekiston operator kodi (90, 91, 93, 94, 95, 97, 98, 99, 33, 88, 77, 50, 20)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await savePhoneNumber(fullPhone);
      showToast('Telefon raqamingiz muvaffaqiyatli saqlandi! ✓', 'success');
      closePhonePrompt();
    } catch (err: any) {
      setError(err?.message || 'Telefon raqamini saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-md modal-backdrop-animate"
      onClick={() => {
        // Can close, but warn
        closePhonePrompt();
        showToast('Eʼlon berish va almashish uchun telefon raqam talab qilinadi', 'info');
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            closePhonePrompt();
            showToast('Eʼlon berish va almashish uchun telefon raqam talab qilinadi', 'info');
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          title="Keyinroq"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Phone className="w-7 h-7 stroke-[1.8]" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Telefon raqamingizni kiriting
          </h3>

          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Kitob egalari bilan bog&#39;lanish va e&#39;lon berish uchun telefon raqamingizni kiriting.
          </p>
        </div>


        {/* Reason Banner if custom */}
        {phonePromptReason && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="font-medium leading-snug">{phonePromptReason}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-400 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="phone-prompt-input"
                className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5"
              >
                <span>Telefon raqam</span>
                <span className="text-red-500 font-bold">*</span>
              </label>

              {operator && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${operator.color}`}
                >
                  {operator.name}
                </span>
              )}
            </div>

            <div className="relative flex items-center rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 focus-within:border-amber-500 dark:focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all overflow-hidden">
              <div className="flex items-center gap-1 px-3.5 py-3 border-r border-stone-200 dark:border-zinc-700 bg-stone-100/70 dark:bg-zinc-800 text-xs font-bold text-stone-700 dark:text-stone-200 select-none shrink-0">
                <span>🇺🇿</span>
                <span>+998</span>
              </div>

              <input
                id="phone-prompt-input"
                type="tel"
                value={phoneInput}
                onChange={handleInputChange}
                placeholder="90 123 45 67"
                maxLength={9}
                autoFocus
                className="w-full py-3 px-3.5 bg-transparent text-sm font-semibold text-stone-900 dark:text-stone-100 tracking-wider placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />

              {isValid && (
                <div className="pr-3 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1.5">
              Namuna: 90 123 45 67 (9 ta raqam)
            </p>
          </div>

          <div className="pt-2">
            <button
              id="phone-prompt-submit-btn"
              type="submit"
              disabled={isSubmitting || rawDigits.length !== 9}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <span>Saqlash va davom etish</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-zinc-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Raqamingiz faqat kitob almashish vaqtida koʻrsatiladi</span>
          </div>
        </form>
      </div>
    </div>
  );
};
