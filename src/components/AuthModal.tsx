'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles,
  Camera,
  Check,
  Bot,
  ExternalLink,
  ArrowLeft,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { LogoIcon } from './Logo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalReason,
    closeAuthModal,
    loginWithProfile,
    loginWithGoogle,
  } = useAuth();

  // Step 1: Input details, Step 2: Verification code
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [email, setEmail] = useState('');
  const [city] = useState('Toshkent');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [verificationCode, setVerificationCode] = useState('');
  const [botDeepLink, setBotDeepLink] = useState('https://t.me/kittouzbot');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
      setError('');
      setSuccessNotice('');
      setStep('form');
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Faqat rasm formatidagi fayl yuklashingiz mumkin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Step 1 -> Step 2: Send verification code via Telegram bot
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanTg = telegramUsername.trim().replace(/^@/, '');

    if (!cleanName) {
      setError('Iltimos, ism va familiyangizni kiriting');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('Iltimos, toʻgʻri telefon raqamingizni kiriting (+998...)');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-telegram-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          name: cleanName,
          username: cleanTg,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Tasdiqlash kodini yuborishda xatolik yuz berdi');
        setIsSendingCode(false);
        return;
      }

      setBotDeepLink(data.botDeepLink || 'https://t.me/kittouzbot');
      setSuccessNotice(data.message || 'Tasdiqlash kodi botga yuborildi');
      setStep('verify');
    } catch {
      setError('Serverga ulanishda xatolik. Qayta urinib koʻring.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Step 2: Verify 6-digit code and complete login
  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Iltimos, 6 xonali tasdiqlash kodini kiriting');
      return;
    }

    setIsVerifyingCode(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-telegram-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: cleanCode,
          name: name.trim(),
          username: telegramUsername.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Notoʻgʻri yoki muddati oʻtgan kod');
        setIsVerifyingCode(false);
        return;
      }

      // Success! Log the user in
      loginWithProfile({
        name: name.trim(),
        contact: phone.trim(),
        telegramUsername: telegramUsername.trim() ? telegramUsername.trim().replace(/^@/, '') : undefined,
        email: email.trim() || undefined,
        city,
        avatar: avatar || undefined,
        provider: 'direct',
      });

      closeAuthModal();
    } catch {
      setError('Tasdiqlashda xatolik. Qayta urinib koʻring.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleGoogleClick = async () => {
    setLoadingGoogle(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch {
      setError('Google orqali kirishda xatolik yuz berdi');
      setLoadingGoogle(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-md modal-backdrop-animate"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 modal-container-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1">
          <div className="flex justify-center mb-3">
            <LogoIcon size={44} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {step === 'form' ? 'Tizimga kirish' : 'Kodni tasdiqlash'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {step === 'form'
              ? "Kitob almashish va e'lon joylash uchun profilingizga kiring"
              : `${phone} raqamiga Telegram bot orqali tasdiqlash kodi yuborildi.`}
          </p>
        </div>

        {/* Reason banner if triggered by a protected action */}
        {authModalReason && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">{authModalReason}</span>
          </div>
        )}

        {step === 'form' ? (
          <>
            {/* Option 1: Modern Full-Width Google OAuth Button */}
            <div className="mt-5">
              <button
                type="button"
                id="auth-google-login-btn"
                onClick={handleGoogleClick}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-100 font-semibold text-xs tracking-wide border border-stone-200/90 dark:border-zinc-700 shadow-xs transition-all active:scale-[0.99] group"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{loadingGoogle ? 'Google tizimiga ulanmoqda...' : 'Google orqali tezkor kirish'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.16em] font-semibold">
                <span className="bg-white dark:bg-zinc-900 px-3 text-stone-400 dark:text-zinc-500">
                  yoki telefon raqam orqali
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRequestCode} className="space-y-3">
              {/* Optional Avatar */}
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/60 dark:border-zinc-800">
                <div className="relative shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profil rasmi"
                      className="w-11 h-11 rounded-full object-cover border-2 border-stone-300 dark:border-zinc-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-stone-200 dark:bg-zinc-700 text-stone-500 dark:text-zinc-300 flex items-center justify-center font-bold text-sm">
                      {name.trim() ? name.trim().charAt(0).toUpperCase() : <Camera className="w-4 h-4 stroke-[1.8]" />}
                    </div>
                  )}
                  {avatar && (
                    <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="auth-avatar-file-input"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-zinc-700 shadow-2xs transition-colors"
                    >
                      {avatar ? "Rasmni almashtirish" : '+ Rasm qoʻshish'}
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar(null)}
                        className="text-[11px] text-stone-400 hover:text-red-600 transition-colors"
                      >
                        Oʻchirish
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ism va familiya (Majburiy) */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Ism va familiya *
                </label>
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="masalan: Sardor Rahimov"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
                />
              </div>

              {/* Telefon raqami */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Telefon raqamingiz *
                </label>
                <input
                  id="auth-phone-input"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
                />
                <p className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">
                  Tasdiqlash kodi @kittouzbot orqali yuboriladi
                </p>
              </div>

              {/* Telegram Username (Ixtiyoriy, raqam pastida) */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Telegram username (ixtiyoriy)
                </label>
                <div className="relative">
                  <input
                    id="auth-telegram-input"
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-sm bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400 transition-all"
                  />
                  <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">
                  Botimizdan tasdiqlash kodini tezkor qabul qilish uchun
                </p>
              </div>

              {/* Email (Ixtiyoriy) */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Email manzil (ixtiyoriy)
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sardor@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400"
                />
              </div>

              {error && (
                <div className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  id="auth-request-code-btn"
                  type="submit"
                  disabled={isSendingCode}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <Bot className="w-4 h-4 text-sky-400 dark:text-sky-600" />
                  <span>{isSendingCode ? 'Kod tayyorlanmoqda...' : 'Telegram orqali kod olish'}</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Step 2: Verification Code View */
          <form onSubmit={handleVerifyAndLogin} className="mt-5 space-y-4">
            {/* Telegram Bot Action Banner */}
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-900 dark:text-sky-200">
                <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Kodingiz @kittouzbot ga yuborildi</span>
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-300">
                Kodni koʻrish uchun botimizga kiring va <b>Start</b> tugmasini bosing:
              </p>
              <a
                href={botDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 w-full"
              >
                <span>🤖 @kittouzbot dan kodni olish</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {successNotice && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5 text-center">
                6 xonali tasdiqlash kodini kiriting
              </label>
              <div className="relative">
                <input
                  id="auth-code-input"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(val);
                    if (error) setError('');
                  }}
                  placeholder="6 xonali kodni kiriting"
                  className="w-full text-center font-mono text-base py-3 rounded-2xl border-2 border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#141413] dark:focus:border-stone-300 transition-all font-bold tracking-widest"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute right-4 top-4 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="text-[11px] text-red-600 dark:text-red-400 flex items-center justify-center gap-1 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit & Back Buttons */}
            <div className="space-y-2 pt-1">
              <button
                id="auth-verify-submit-btn"
                type="submit"
                disabled={isVerifyingCode || verificationCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-semibold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.99] disabled:opacity-40"
              >
                <UserCheck className="w-4 h-4 stroke-[2.2]" />
                <span>{isVerifyingCode ? 'Tekshirilmoqda...' : 'Tasdiqlash va tizimga kirish'}</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setVerificationCode('');
                    setError('');
                  }}
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-stone-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Raqamni oʻzgartirish</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleRequestCode(e)}
                  className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kodni qayta soʻrash</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Security Note */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-[10px] tracking-wide text-stone-400 dark:text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Telegram bot orqali 100% xavfsiz tasdiqlash</span>
        </div>
      </div>
    </div>
  );
};
