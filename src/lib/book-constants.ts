/**
 * Kitto (kitto.uz) Book Constants
 * ZERO STOCK PHOTOS — All books require authentic user-uploaded photos.
 */

export const BOOK_CATEGORIES = [
  'Badiiy adabiyot',
  'Shaxsiy rivojlanish',
  'Biznes & Moliya',
  'IT & Dasturlash',
  'Tarix & Falsafa',
  'Psixologiya',
  'Chet tillari',
  'Boshqa',
] as const;

export const BOOK_CONDITIONS = [
  { id: 'yangi', label: 'Yangi' },
  { id: 'yaxshi', label: "A'lo holatda" },
  { id: 'oʻqilgan', label: "O'qilgan (yaxshi)" },
] as const;

export const formatBookCondition = (condition?: string): string => {
  if (!condition) return "A'lo holatda";
  const lower = condition.toLowerCase().trim();
  if (lower === 'yangi' || lower === 'new') return 'Yangi';
  if (lower === 'yaxshi' || lower.includes("a'lo") || lower.includes('alo') || lower === 'like new') return "A'lo holatda";
  if (lower.includes('oʻqilgan') || lower.includes("o'qilgan") || lower.includes('oqilgan') || lower === 'good' || lower === 'used') return "O'qilgan (yaxshi)";
  return condition;
};

export const formatSwapTermType = (termType?: string): string => {
  if (termType === 'gift') return 'Hadya qilinadi';
  if (termType === 'temporary') return "Vaqtincha o'qishga";
  return 'Doimiy almashish';
};

