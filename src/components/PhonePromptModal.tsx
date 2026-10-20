'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Phone, Sparkles, Check, AlertCircle, X, ShieldCheck, Bot, ExternalLink, ArrowLeft, KeyRound } from 'lucide-react';
import { isValidUzbekPhone, formatUzbekPhone, getUzbekOperator } from '@/utils/phone';
import { UZBEKISTAN_REGIONS } from '@/lib/regions';

export const PhonePromptModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPhonePromptOpen,
    phonePromptReason,
    closePhonePrompt,
    savePhoneNumber,
    updateProfile,
  } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [city, setCity] = useState('Toshkent shahri');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [botDeepLink, setBotDeepLink] = useState('https://t.me/kittouzbot');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // If user already has a partial phone or valid phone, pre-fill
  useEffect(() => {
    if (user?.contact && !user.contact.includes('@')) {
      setPhoneInput(user.contact.replace('+998', '').trim());
    } else {
      setPhoneInput('');
    }
    if (user?.city) {
      setCity(user.city);
    }
    if (user?.telegramUsername) {
      setTelegramUsername(user.telegramUsername.replace(/^@/, ''));
    }
    setError('');
    setSuccessNotice('');
    setStep('phone');
    setVerificationCode('');
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

  const getFullPhone = () => {
    return `+998 ${rawDigits.substring(0, 2)} ${rawDigits.substring(2, 5)} ${rawDigits.substring(5, 7)} ${rawDigits.substring(7, 9)}`;
  };

  // Step 1: Send Telegram verification code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDigits || rawDigits.length !== 9) {
      setError('Iltimos, 9 xonali telefon raqamingizni toʻliq kiriting');
      return;
    }

    const fullPhone = getFullPhone();
    if (!isValidUzbekPhone(fullPhone)) {
      setError('Notoʻgʻri Oʻzbekiston operator kodi (90, 91, 93, 94, 95, 97, 98, 99, 33, 88, 77, 50, 20)');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-telegram-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          name: user?.name,
          username: telegramUsername.trim() || user?.telegramUsername,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Tasdiqlash kodini yuborishda xatolik yuz berdi');
        setIsSendingCode(false);
        return;
      }

      setBotDeepLink(data.botDeepLink || 'https://t.me/kittouzbot');
      setSuccessNotice(data.message || 'Tasdiqlash kodi Telegram botga yuborildi');
      setStep('verify');
    } catch {
      setError('Serverga ulanishda xatolik. Qayta urinib koʻring.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Step 2: Verify code and save phone number
  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Iltimos, 6 xonali tasdiqlash kodini kiriting');
      return;
    }

    const fullPhone = getFullPhone();
    setIsVerifyingCode(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-telegram-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          code: cleanCode,
          name: user?.name,
          username: telegramUsername.trim() || user?.telegramUsername,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Notoʻgʻri yoki muddati oʻtgan kod');
        setIsVerifyingCode(false);
        return;
      }

      await savePhoneNumber(fullPhone);
      if (updateProfile) {
        updateProfile({
          contact: fullPhone,
          city: city || 'Toshkent shahri',
          telegramUsername: telegramUsername.trim() || user?.telegramUsername,
        });
      }
      showToast('Telefon raqamingiz muvaffaqiyatli tasdiqlandi va saqlandi', 'success');
      closePhonePrompt();
    } catch (err: any) {
      setError(err?.message || 'Telefon raqamini saqlashda xatolik yuz berdi');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-md modal-backdrop-animate"
      onClick={() => {
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

        {/* Back Button if in Verify Step */}
        {step === 'verify' && (
          <button
            onClick={() => {
              setStep('phone');
              setError('');
              setVerificationCode('');
            }}
            className="absolute top-4 left-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs"
            title="Orqaga"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            {step === 'phone' ? (
              <Phone className="w-7 h-7 stroke-[1.8]" />
            ) : (
              <KeyRound className="w-7 h-7 stroke-[1.8]" />
            )}
          </div>

          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {step === 'phone' ? 'Telefon raqamingizni kiriting' : 'Tasdiqlash kodi'}
          </h3>

          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {step === 'phone'
              ? 'Xavfsiz almashish uchun raqamingizga Telegram bot orqali tasdiqlash kodi yuboriladi.'
              : `${getFullPhone()} raqamiga Telegram bot orqali 6 xonali kod yuborildi.`}
          </p>
        </div>

        {/* Reason Banner if custom */}
        {phonePromptReason && step === 'phone' && (
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

        {/* Step 1: Enter Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handleRequestCode} className="mt-5 space-y-4">
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
                <div className="flex items-center gap-1.5 px-3.5 py-3 border-r border-stone-200 dark:border-zinc-700 bg-stone-100/70 dark:bg-zinc-800 text-xs font-bold text-stone-700 dark:text-stone-200 select-none shrink-0">
                  <span className="text-[10px] px-1 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-stone-300 font-bold">UZ</span>
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

            {/* Region / City Select */}
            <div>
              <label
                htmlFor="phone-prompt-city"
                className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5"
              >
                Viloyat / Hududingiz
              </label>
              <select
                id="phone-prompt-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              >
                {UZBEKISTAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="phone-prompt-tg"
                className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5"
              >
                Telegram username (ixtiyoriy)
              </label>
              <div className="relative flex items-center rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 focus-within:border-amber-500 dark:focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all overflow-hidden">
                <span className="px-3 text-xs font-bold text-stone-400 select-none">@</span>
                <input
                  id="phone-prompt-tg"
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ''))}
                  placeholder="username"
                  className="w-full py-2.5 pr-3.5 bg-transparent text-xs font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="phone-prompt-submit-btn"
                type="submit"
                disabled={isSendingCode || rawDigits.length !== 9}
                className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSendingCode ? (
                  <span>Kod yuborilmoqda...</span>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Telegram orqali kod olish</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-zinc-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Raqamingiz faqat tasdiqlangan almashuvlarda koʻrsatiladi</span>
            </div>
          </form>
        )}

        {/* Step 2: Verification Code Form */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyAndSave} className="mt-5 space-y-4">
            {/* Telegram Bot Deep Link Button */}
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-900 dark:text-sky-200">
                <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Kodni bot orqali tekshirish:</span>
              </div>
              <a
                href={botDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 w-full"
              >
                <Bot className="w-4 h-4" />
                <span>@kittouzbot ni ochish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {successNotice && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="phone-verify-code"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 text-center"
              >
                6 xonali tasdiqlash kodini kiriting
              </label>
              <input
                id="phone-verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(val);
                  if (error) setError('');
                }}
                placeholder="123456"
                autoFocus
                className="w-full py-3 px-4 text-center text-2xl font-mono font-bold tracking-[0.3em] rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-stone-900 dark:text-stone-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-stone-400 placeholder:text-sm"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isVerifyingCode || verificationCode.length !== 6}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifyingCode ? (
                  <span>Tasdiqlanmoqda...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tasdiqlash va saqlash</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                  setVerificationCode('');
                }}
                className="w-full py-2 text-center text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors"
              >
                Raqamni oʻzgartirish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
