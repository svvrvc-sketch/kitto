'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  BookOpen,
  Camera,
  ScanLine,
  RefreshCw,
  Sparkles,
  UploadCloud,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { Book } from '@/types/book';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import jsQR from 'jsqr';

interface SwapQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  mode?: 'handover' | 'return'; // 'handover': Kitob topshirish, 'return': Kitobni qaytarib olish
  onConfirmSuccess: (bookId: string, newStatus: 'temporarily_given' | 'swapped' | 'active') => void;
}

export const SwapQRModal: React.FC<SwapQRModalProps> = ({
  isOpen,
  onClose,
  book,
  mode = 'handover',
  onConfirmSuccess,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Active view: 'present' (QR-kodni ko'rsatish) vs 'scanner' (Kamera orqali skanerlash)
  const [activeTab, setActiveTab] = useState<'present' | 'scanner'>('present');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<{ bookId: string; code?: string } | null>(null);

  // Camera & Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate deterministic 6-digit verification code based on book ID
  const shortCode = book
    ? `KITTO-${((book.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 97) % 9000 + 1000)}`
    : 'KITTO-0000';

  const verificationUrl = book
    ? `https://kitto-fakv.vercel.app/?verify_swap=${encodeURIComponent(book.id)}&code=${shortCode}`
    : 'https://kitto-fakv.vercel.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(
    verificationUrl
  )}`;

  // Safe camera stream cleaner
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Complete handover / return action & award trust score
  const completeAction = useCallback(
    async (targetBookId?: string) => {
      const bookToConfirm = targetBookId || book?.id;
      if (!bookToConfirm) return;

      setIsSubmitting(true);
      try {
        const currentTrust = user?.trustScore || 0;
        const newTrust = currentTrust + 1;
        const isTrustedNow = newTrust >= 3;

        updateProfile({
          trustScore: newTrust,
          isTrusted: isTrustedNow,
          completedSwaps: (user?.completedSwaps || 0) + 1,
        });

        let targetStatus: 'temporarily_given' | 'swapped' | 'active' = 'swapped';
        if (mode === 'handover') {
          targetStatus = book?.swapTerm?.type === 'temporary' ? 'temporarily_given' : 'swapped';
          showToast(`🎉 Kitob topshirildi! Profilingizga +1 ishonch bali qoʻshildi (Jami: ${newTrust})`, 'success');
        } else {
          targetStatus = 'active';
          showToast(`🎉 Kitob toza va oʻz vaqtida qabul qilindi! +1 ishonch bali qoʻshildi (Jami: ${newTrust})`, 'success');
        }

        // Haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {
            // ignore
          }
        }

        setScanSuccess(true);
        onConfirmSuccess(bookToConfirm, targetStatus);

        setTimeout(() => {
          stopCamera();
          onClose();
        }, 1500);
      } catch (e) {
        console.error('Confirmation error:', e);
        showToast('Xatolik yuz berdi, qaytadan urinib koʻring', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [book, mode, user, updateProfile, showToast, onConfirmSuccess, onClose, stopCamera]
  );

  // Process raw text / URL decoded from QR scanner
  const handleDecodedString = useCallback(
    (decoded: string) => {
      if (!decoded || scanSuccess) return;

      try {
        let extractedBookId = book?.id;
        let extractedCode = '';

        if (decoded.includes('verify_swap=')) {
          const urlObj = new URL(decoded);
          extractedBookId = urlObj.searchParams.get('verify_swap') || extractedBookId;
          extractedCode = urlObj.searchParams.get('code') || '';
        } else if (decoded.startsWith('KITTO-')) {
          extractedCode = decoded.trim();
        } else if (decoded.startsWith('book-') || decoded.startsWith('bk_')) {
          extractedBookId = decoded.trim();
        }

        setScannedResult({ bookId: extractedBookId || 'verified', code: extractedCode });
        completeAction(extractedBookId);
      } catch {
        // Fallback: match direct text
        setScannedResult({ bookId: book?.id || 'verified', code: decoded });
        completeAction(book?.id);
      }
    },
    [book, scanSuccess, completeAction]
  );

  // Continuous frame decoder loop
  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 1. Try fast native BarcodeDetector if supported
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            detector
              .detect(video)
              .then((barcodes: any[]) => {
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  handleDecodedString(barcodes[0].rawValue);
                  return;
                }
              })
              .catch(() => {});
          } catch {
            // fallback to jsQR
          }
        }

        // 2. High-precision jsQR engine
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDecodedString(code.data);
          return;
        }
      }
    }

    if (!scanSuccess) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [handleDecodedString, scanSuccess]);

  // Start video stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Qurilmangizda kamera qoʻllab-quvvatlanmaydi yoki ruxsat yoʻq');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn('Camera access warning:', err);
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Kameradan foydalanish uchun brauzer ruxsatini yoqing'
          : 'Kamerani ishga tushirib boʻlmadi. Kod orqali tasdiqlashingiz mumkin.';
      setCameraError(msg);
      setIsCameraActive(false);
    }
  }, [facingMode, stopCamera, tick]);

  // Handle image upload scanning from gallery/screenshots
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            showToast('QR-kod aniqlandi ✓', 'success');
            handleDecodedString(code.data);
          } else {
            showToast('Rasmdan QR-kod topilmadi. Boshqa rasm tanlang yoki kodni yozing.', 'error');
          }
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        showToast('Rasmni oʻqib boʻlmadi', 'error');
      };
    };
    reader.readAsDataURL(file);
  };

  // Manual code submission
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCodeInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === shortCode || clean.replace(/\D/g, '') === shortCode.replace(/\D/g, '')) {
      showToast('Tasdiqlash kodi toʻgʻri! ✓', 'success');
      handleDecodedString(shortCode);
    } else {
      showToast('Notoʻgʻri tasdiqlash kodi. Qaytadan tekshirib koʻring.', 'error');
    }
  };

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'scanner' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen, startCamera, stopCamera]);

  // Clean on unmount or close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
      stopCamera();
    };
  }, [isOpen, onClose, stopCamera]);

  if (!isOpen || !book) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(shortCode);
    setCopied(true);
    showToast('Tasdiqlash kodi nusxalandi ✓', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const isTemporary = book.swapTerm?.type === 'temporary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-md modal-backdrop-animate"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl p-5 sm:p-7 modal-container-animate flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Canvas for QR frame processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors z-20"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center pt-1 mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2.5 shadow-xs">
            <QrCode className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Kitobni topshirish
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Uchrashuvda ushbu QR-kodni ikkinchi tomonga ko&#39;rsating yoki 6 xonali kodni ayting.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 dark:bg-zinc-800/90 border border-stone-200/80 dark:border-zinc-700/80 mb-4 text-xs font-semibold">
          <button
            type="button"
            id="qr-tab-present"
            onClick={() => setActiveTab('present')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'present'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>QR-kod (Ko&#39;rsatish)</span>
          </button>

          <button
            type="button"
            id="qr-tab-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'scanner'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>QR-kodni skanerlash</span>
          </button>
        </div>

        {/* Book Mini Meta Preview */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-700/60 flex items-center gap-3 mb-4">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-10 h-14 object-cover rounded-lg border border-stone-200 dark:border-zinc-700 shrink-0"
            />
          ) : (
            <div className="w-10 h-14 rounded-lg bg-stone-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-stone-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
              {book.title}
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">{book.author}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              <Clock className="w-3 h-3" />
              <span>{book.swapTerm?.durationLabel || 'Almashuv'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PRESENT QR CODE (Foydalanuvchi QR-kodini ko'rsatishi uchun) */}
        {/* ========================================================================= */}
        {activeTab === 'present' && (
          <div className="flex flex-col items-center animate-in fade-in duration-200">
            <div className="relative p-2.5 rounded-3xl bg-white border border-stone-200 shadow-md">
              <img
                src={qrImageUrl}
                alt="Kitto Swap QR Code"
                className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-2xl"
                loading="eager"
              />
            </div>

            {/* Verification Code Pill with 1-click copy */}
            <div className="mt-3.5 flex items-center gap-2">
              <div className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono font-bold text-sm text-stone-900 dark:text-stone-100 tracking-wider">
                {shortCode}
              </div>
              <button
                type="button"
                id="copy-swap-code-btn"
                onClick={handleCopyCode}
                className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors"
                title="Kodni nusxalash"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1 text-center max-w-xs">
              Uchrashuvda ushbu QR-kodni ikkinchi tomonga ko&#39;rsating yoki 6 xonali kodni ayting.
            </span>

            {/* Trust Score Pill */}
            <div className="w-full mt-4 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-medium">
                  Tasdiqlangach profilingizga <b>+1 ishonch bali</b> beriladi
                </span>
              </div>
              <span className="font-bold font-serif text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white shrink-0">
                +1 Ball
              </span>
            </div>

            {/* Direct Confirmation Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => completeAction()}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#141413] hover:bg-black dark:bg-stone-200 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>
                {mode === 'handover'
                  ? isTemporary
                    ? 'Kitob topshirildi deb tasdiqlash ✓'
                    : 'Kitob almashildi deb tasdiqlash ✓'
                  : 'Kitob toza qaytarildi deb tasdiqlash ✓'}
              </span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE CAMERA SCANNER (Kamera orqali QR-kodni skanerlash) */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && (
          <div className="flex flex-col items-center animate-in fade-in duration-200 w-full">
            {/* Viewfinder Container */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden bg-black border border-stone-800 shadow-xl flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Laser / Radar Scanning Animation Line */}
              {isCameraActive && !scanSuccess && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-scan z-10 pointer-events-none" />
              )}

              {/* Viewfinder Targeting Corners */}
              <div className="absolute inset-6 pointer-events-none border-2 border-transparent">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
              </div>

              {/* Success Celebration Overlay */}
              {scanSuccess && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-in zoom-in duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-2">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-white">QR-kod tasdiqlandi!</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">Almashuv muvaffaqiyatli yakunlandi ✓</p>
                </div>
              )}

              {/* Camera Error / Not active banner */}
              {!isCameraActive && cameraError && (
                <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center p-4 text-center z-10">
                  <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-xs text-stone-200 leading-relaxed max-w-[220px]">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    Qayta urinish
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls & Options */}
            <div className="flex items-center justify-center gap-2 mt-3 w-full">
              {/* Flip camera */}
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kamerani almashtirish</span>
              </button>

              {/* Scan from gallery photo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                <span>{isProcessingImage ? 'Oʻqilmoqda...' : 'Galereyadan'}</span>
              </button>
            </div>

            {/* Manual Code Input Option */}
            <div className="w-full mt-4 pt-4 border-t border-stone-200/80 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400 block mb-1.5 text-center">
                Tasdiqlash kodi:
              </span>
              <form onSubmit={handleManualCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  placeholder="Masalan: KITTO-1234"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-xs font-mono font-bold uppercase text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!manualCodeInput.trim() || isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-[#141413] hover:bg-black dark:bg-stone-200 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                >
                  Tasdiqlash
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-full mt-3 py-2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-medium transition-colors text-center"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};
