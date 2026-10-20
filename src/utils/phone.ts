/**
 * Phone formatting and validation utilities for Uzbekistan (+998)
 */

export const isValidUzbekPhone = (contact?: string | null): boolean => {
  if (!contact || typeof contact !== 'string') return false;
  // If contact contains '@', it is an email, not a phone number!
  if (contact.includes('@')) return false;

  const digits = contact.replace(/\D/g, '');
  // 9 digits (e.g. 901234567) or 12 digits (998901234567)
  if (digits.length === 9) {
    const code = digits.substring(0, 2);
    return ['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '77', '50', '20'].includes(code);
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    const code = digits.substring(3, 5);
    return ['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '77', '50', '20'].includes(code);
  }
  return false;
};

export const formatUzbekPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  digits = digits.substring(0, 9);

  let formatted = '+998';
  if (digits.length > 0) formatted += ` ${digits.substring(0, 2)}`;
  if (digits.length > 2) formatted += ` ${digits.substring(2, 5)}`;
  if (digits.length > 5) formatted += ` ${digits.substring(5, 7)}`;
  if (digits.length > 7) formatted += ` ${digits.substring(7, 9)}`;
  return formatted;
};

export const getUzbekOperator = (raw: string): { name: string; color: string } | null => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  if (digits.length < 2) return null;
  const prefix = digits.substring(0, 2);

  switch (prefix) {
    case '90':
    case '91':
      return { name: 'Beeline', color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' };
    case '93':
    case '94':
    case '50':
      return { name: 'Ucell', color: 'bg-purple-500/15 text-purple-700 border-purple-500/30' };
    case '97':
    case '88':
      return { name: 'Mobiuz', color: 'bg-red-500/15 text-red-700 border-red-500/30' };
    case '95':
    case '99':
    case '77':
      return { name: 'Uztelecom', color: 'bg-blue-500/15 text-blue-700 border-blue-500/30' };
    case '33':
      return { name: 'Humans', color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' };
    case '20':
      return { name: 'Oq', color: 'bg-stone-500/15 text-stone-700 border-stone-500/30' };
    default:
      return null;
  }
};
