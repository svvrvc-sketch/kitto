/**
 * Telegram Authentication & Code Verification Service for Kitto (Kitto.uz)
 * Integrates with @kittouzbot (Token: 8890224721:AAGaspC6qK7ferPtSJ9Bm2HSe5osfGHrsQM)
 */

export const TELEGRAM_BOT_TOKEN = '8890224721:AAGaspC6qK7ferPtSJ9Bm2HSe5osfGHrsQM';
export const TELEGRAM_BOT_USERNAME = 'kittouzbot';

export interface PendingVerification {
  phone: string;
  code: string;
  username?: string;
  name?: string;
  expiresAt: number;
  chatId?: number | string;
}

// Global in-memory code store (persists across API requests in server runtime)
declare global {
  // eslint-disable-next-line no-var
  var __kittoVerificationCodes: Map<string, PendingVerification> | undefined;
  // eslint-disable-next-line no-var
  var __kittoTelegramUserChats: Map<string, number | string> | undefined;
}

if (!global.__kittoVerificationCodes) {
  global.__kittoVerificationCodes = new Map();
}

if (!global.__kittoTelegramUserChats) {
  global.__kittoTelegramUserChats = new Map();
}

const codesStore = global.__kittoVerificationCodes;
const userChatsStore = global.__kittoTelegramUserChats;

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '').trim();
}

export function normalizeUsername(username?: string): string {
  if (!username) return '';
  return username.replace(/^@/, '').trim().toLowerCase();
}

/**
 * Creates and registers a new 6-digit verification code
 */
export function createVerificationCode(params: {
  phone: string;
  name?: string;
  username?: string;
}): { code: string; expiresAt: number; botDeepLink: string } {
  const cleanPhone = normalizePhone(params.phone);
  const cleanUsername = normalizeUsername(params.username);

  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  const record: PendingVerification = {
    phone: cleanPhone,
    code,
    name: params.name,
    username: cleanUsername,
    expiresAt,
  };

  // Store by phone number
  codesStore.set(cleanPhone, record);
  // Also store by code for deep-link lookup (/start 123456)
  codesStore.set(`code_${code}`, record);

  if (cleanUsername) {
    codesStore.set(`user_${cleanUsername}`, record);
  }

  const botDeepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`;

  return { code, expiresAt, botDeepLink };
}

/**
 * Verifies a submitted 6-digit code for a phone number
 */
export function verifyCode(phone: string, inputCode: string): { valid: boolean; error?: string } {
  const cleanPhone = normalizePhone(phone);
  const cleanCode = inputCode.trim();

  const record = codesStore.get(cleanPhone);

  if (!record) {
    // Try lookup by code directly
    const byCode = codesStore.get(`code_${cleanCode}`);
    if (byCode && byCode.code === cleanCode && byCode.expiresAt > Date.now()) {
      codesStore.delete(`code_${cleanCode}`);
      codesStore.delete(byCode.phone);
      return { valid: true };
    }
    return { valid: false, error: 'Tasdiqlash kodi topilmadi yoki muddati oʻtgan' };
  }

  if (record.expiresAt < Date.now()) {
    codesStore.delete(cleanPhone);
    codesStore.delete(`code_${record.code}`);
    return { valid: false, error: 'Kodingizning 5 daqiqalik muddati tugagan. Qaytadan kod soʻrang.' };
  }

  if (record.code !== cleanCode) {
    return { valid: false, error: 'Notoʻgʻri tasdiqlash kodi kiritildi' };
  }

  // Code verified successfully! Clean up used code
  codesStore.delete(cleanPhone);
  codesStore.delete(`code_${cleanCode}`);
  if (record.username) {
    codesStore.delete(`user_${record.username}`);
  }

  return { valid: true };
}

/**
 * Dispatches code directly to a user's Telegram chat if chat_id is known
 */
export async function sendTelegramDirectCode(
  chatId: string | number,
  code: string,
  userName?: string
): Promise<boolean> {
  try {
    const text =
      `📚 <b>Kitto.uz — Kirish kodi</b>\n\n` +
      `Assalomu alaykum${userName ? `, ${userName}` : ''}!\n` +
      `Sizning tasdiqlash kodingiz:\n\n` +
      `👉 <b><code>${code}</code></b>\n\n` +
      `<i>Ushbu kodni saytga kiriting. Kod 5 daqiqa davomida amal qiladi.</i>`;

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    return res.ok;
  } catch (e) {
    console.warn('[Telegram Direct Send Error]:', e);
    return false;
  }
}

/**
 * Register chat ID for a username or phone
 */
export function registerUserChatId(identifier: string, chatId: number | string) {
  userChatsStore.set(identifier.toLowerCase(), chatId);
}

export function getUserChatId(identifier: string): number | string | undefined {
  return userChatsStore.get(identifier.toLowerCase());
}

export function getCodeRecord(key: string): PendingVerification | undefined {
  return codesStore.get(key);
}
