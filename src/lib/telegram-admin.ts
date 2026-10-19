import { TELEGRAM_BOT_TOKEN } from './telegram-auth';
import { supabaseUrl, supabaseAnonKey } from './supabase';
import { createClient } from '@supabase/supabase-js';

export const ADMIN_USERNAME = 'svrvc';
export const ADMIN_PHONE = '+998337533373';
export const SUPPORT_PHONE = '+998337533373';
export const SUPPORT_TELEGRAM = 'kitto_support';

// Global store for persistent admin chat ID during server runtime
declare global {
  // eslint-disable-next-line no-var
  var __kittoAdminChatId: number | string | undefined;
}

export function setAdminChatId(chatId: number | string) {
  global.__kittoAdminChatId = chatId;
  // Also persist to Supabase if connected
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
      client
        .from('profiles')
        .update({ telegram_chat_id: String(chatId) })
        .or(`telegram_username.ilike.${ADMIN_USERNAME},contact.eq.${ADMIN_PHONE},role.eq.admin`)
        .then(() => {})
        .catch(() => {});
    } catch {
      // ignore background error
    }
  }
}

export function getAdminChatId(): number | string | undefined {
  return global.__kittoAdminChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;
}

/**
 * Fetch live statistics from Supabase Database
 */
export async function getLiveSiteStats(): Promise<{
  usersCount: number;
  booksCount: number;
  activeBooksCount: number;
  swappedBooksCount: number;
  temporaryBooksCount: number;
  votesCount: number;
  formattedText: string;
}> {
  let usersCount = 0;
  let booksCount = 0;
  let activeBooksCount = 0;
  let swappedBooksCount = 0;
  let temporaryBooksCount = 0;
  let votesCount = 0;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      // 1. Users count
      const { count: uCount } = await client
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      usersCount = uCount ?? 0;

      // 2. Books total
      const { count: bCount } = await client
        .from('books')
        .select('*', { count: 'exact', head: true });
      booksCount = bCount ?? 0;

      // 3. Active books
      const { count: aCount } = await client
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      activeBooksCount = aCount ?? 0;

      // 4. Swapped books
      const { count: sCount } = await client
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'swapped');
      swappedBooksCount = sCount ?? 0;

      // 5. Temporary books
      const { count: tCount } = await client
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'temporarily_given');
      temporaryBooksCount = tCount ?? 0;

      // 6. Regional votes (waitlist)
      const { data: votesData } = await client
        .from('regional_votes')
        .select('votes_count');
      if (votesData && Array.isArray(votesData)) {
        votesCount = votesData.reduce((acc, row) => acc + (Number(row.votes_count) || 0), 0);
      }
    } catch (e) {
      console.warn('[Site Stats Error]:', e);
    }
  }

  const formattedTime = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedText =
    `📊 <b>KITTO.UZ — SAYT STATISTIKASI</b>\n\n` +
    `👥 <b>Jami foydalanuvchilar:</b> ${usersCount} nafar\n` +
    `📚 <b>Jami kitoblar:</b> ${booksCount} ta\n` +
    `   • 🟢 <b>Faol eʼlonlar:</b> ${activeBooksCount} ta\n` +
    `   • 🔄 <b>Almashilgan:</b> ${swappedBooksCount} ta\n` +
    `   • ⏳ <b>Vaqtincha oʻqishga:</b> ${temporaryBooksCount} ta\n\n` +
    `📍 <b>Viloyatlar boʻyicha ovozlar:</b> ${votesCount} ta\n` +
    `⏰ <b>Yangilangan:</b> ${formattedTime}\n\n` +
    `<i>Boshqaruv: @${ADMIN_USERNAME}</i>`;

  return {
    usersCount,
    booksCount,
    activeBooksCount,
    swappedBooksCount,
    temporaryBooksCount,
    votesCount,
    formattedText,
  };
}

/**
 * Sends a rich, structured notification to Admin on every new user registration/login
 */
export async function notifyAdminNewUser(user: {
  name: string;
  contact: string;
  telegramUsername?: string;
  email?: string;
  city?: string;
  provider?: string;
  id?: string;
}): Promise<boolean> {
  let adminChatId = getAdminChatId();

  // Try DB fallback if adminChatId not in memory
  if (!adminChatId && supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
      const { data } = await client
        .from('profiles')
        .select('telegram_chat_id')
        .not('telegram_chat_id', 'is', null)
        .or(`telegram_username.ilike.${ADMIN_USERNAME},contact.eq.${ADMIN_PHONE},role.eq.admin`)
        .limit(1)
        .maybeSingle();
      if (data?.telegram_chat_id) {
        adminChatId = data.telegram_chat_id;
        global.__kittoAdminChatId = adminChatId;
      }
    } catch {
      // ignore
    }
  }

  const formattedTime = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cleanTg = user.telegramUsername
    ? `@${user.telegramUsername.replace(/^@/, '')}`
    : user.contact.startsWith('@')
    ? user.contact
    : 'Kiritilmagan';

  const text =
    `🎉 <b>YANGI FOYDALANUVCHI ROʻYXATDAN OʻTDI!</b>\n\n` +
    `👤 <b>Ism:</b> ${escapeHtml(user.name)}\n` +
    `📞 <b>Telefon:</b> <code>${escapeHtml(user.contact)}</code>\n` +
    `✈️ <b>Telegram:</b> ${escapeHtml(cleanTg)}\n` +
    (user.email ? `📧 <b>Email:</b> ${escapeHtml(user.email)}\n` : '') +
    `📍 <b>Hudud:</b> ${escapeHtml(user.city || 'Toshkent')}\n` +
    `🌐 <b>Usul:</b> ${escapeHtml(user.provider || 'Telegram kod')}\n` +
    `⏰ <b>Vaqt:</b> ${formattedTime}\n` +
    (user.id ? `🆔 <b>ID:</b> <code>${escapeHtml(user.id)}</code>\n` : '') +
    `\n<i>Kitto.uz avtomatik xabarnomasi</i>`;

  // Collect target recipients: explicit admin chat + discovered chats
  const targets = new Set<string | number>();
  if (adminChatId) targets.add(adminChatId);

  // If we don't have explicit admin chat id yet, send to any known admin
  if (targets.size === 0) {
    // Attempt to send to bot owner if they sent message
    const { getUserChatId } = await import('./telegram-auth');
    const svrvcChat = getUserChatId(ADMIN_USERNAME) || getUserChatId(ADMIN_PHONE);
    if (svrvcChat) targets.add(svrvcChat);
  }

  if (targets.size === 0) {
    console.log('[Admin Notify] No admin chat ID discovered yet. Will send once @svrvc presses /start in @kittouzbot');
    return false;
  }

  let sent = false;
  for (const chatId of Array.from(targets)) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
      if (res.ok) sent = true;
    } catch (e) {
      console.warn(`[Admin Notify Send Error to ${chatId}]:`, e);
    }
  }

  return sent;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
