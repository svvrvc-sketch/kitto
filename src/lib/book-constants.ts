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
  { id: 'yangi', label: 'Yangi (ochilmagan)' },
  { id: 'yaxshi', label: 'Yaxshi (saqlangan)' },
  { id: 'oʻqilgan', label: 'Oʻqilgan (ishlatilgan)' },
] as const;
