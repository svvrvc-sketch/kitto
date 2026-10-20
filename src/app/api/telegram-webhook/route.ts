/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  TELEGRAM_BOT_TOKEN,
  getCodeRecord,
  registerUserChatId,
  normalizeUsername,
  normalizePhone,
} from '@/lib/telegram-auth';
import {
  ADMIN_USERNAME,
  ADMIN_PHONE,
  SUPPORT_PHONE,
  SUPPORT_TELEGRAM,
  setAdminChatId,
  getLiveSiteStats,
} from '@/lib/telegram-admin';

export async function POST(req: Request) {
  try {
    const update = await req.json();

    const message = update.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const fromUser = message.from;
    const text: string = (message.text || '').trim();

    if (!chatId) return NextResponse.json({ ok: true });

    const rawUsername = fromUser?.username ? normalizeUsername(fromUser.username) : '';
    const rawContactPhone = message.contact?.phone_number ? normalizePhone(message.contact.phone_number) : '';
    const textPhone = normalizePhone(text);

    // Register user's chat_id
    if (rawUsername) {
      registerUserChatId(rawUsername, chatId);
    }
    if (rawContactPhone) {
      registerUserChatId(rawContactPhone, chatId);
    }

    // Check if this is Admin (@svrvc or +998337533373)
    const isAdmin =
      rawUsername === ADMIN_USERNAME.toLowerCase() ||
      rawContactPhone === normalizePhone(ADMIN_PHONE) ||
      textPhone === normalizePhone(ADMIN_PHONE);

    if (isAdmin) {
      setAdminChatId(chatId);
    }

    // 1. Handle Admin Stats Request: "/stats" or "Sayt statistikasi"
    if (text === '/stats' || text.includes('Statistika') || text.includes('statistika')) {
      const stats = await getLiveSiteStats();
      await sendMessage(chatId, stats.formattedText, getAdminKeyboard());
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Support / Help Command: "/support", "/help", or "Support"
    if (text === '/support' || text === '/help' || text.includes('Support') || text.includes('support') || text.includes('Yordam')) {
      const supportText =
        `<b>Kitto.uz — Qoʻllab-quvvatlash xizmati</b>\n\n` +
        `Qandaydir savol va takliflar boʻlsa, biz bilan bogʻlaning:\n\n` +
        `<b>Telefon:</b> <code>${SUPPORT_PHONE}</code>\n` +
        `<b>Telegram:</b> @${SUPPORT_TELEGRAM}\n\n` +
        `<i>Biz har doim yordam berishga tayyormiz!</i>`;

      await sendMessage(
        chatId,
        supportText,
        isAdmin ? getAdminKeyboard() : undefined
      );
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Website Link: "Saytni ochish" or "/site"
    if (text.includes('Saytni ochish') || text === '/site' || text.toLowerCase() === 'sayt') {
      const siteText =
        `<b>Kitto.uz Rasmiy Sayti:</b>\n\n` +
        `Kitob almashish va mutolaa maydoni:\n` +
        `https://kitto-fakv.vercel.app\n\n` +
        `<i>Kitoblar dunyosiga xush kelibsiz!</i>`;
      await sendMessage(chatId, siteText, isAdmin ? getAdminKeyboard() : undefined);
      return NextResponse.json({ ok: true });
    }

    // 4. Handle /start command
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const payload = parts[1]?.trim(); // e.g. /start 482915 or /start code_482915

      // Admin Welcome
      if (isAdmin) {
        const adminGreeting =
          `<b>Assalomu alaykum, Admin (@${ADMIN_USERNAME})!</b>\n\n` +
          `Siz Kitto.uz platformasi boshqaruvchisiz.\n` +
          `Sizning chat identifikatoringiz tizimga ulandi.\n\n` +
          `Har bir yangi roʻyxatdan oʻtgan foydalanuvchi haqidagi xabarnomalar toʻgʻridan-toʻgʻri shu yerga yuboriladi!\n\n` +
          `Sayt statistikasini koʻrish uchun pastdagi <b>Sayt statistikasi</b> tugmasini bosing.`;

        await sendMessage(chatId, adminGreeting, getAdminKeyboard());
        return NextResponse.json({ ok: true });
      }

      // Regular User Welcome / Verification Code
      let codeToSend: string | null = null;

      if (payload && /^\d{6}$/.test(payload)) {
        codeToSend = payload;
      } else if (payload && payload.startsWith('code_')) {
        codeToSend = payload.replace('code_', '');
      } else if (rawUsername) {
        const pending = getCodeRecord(`user_${rawUsername}`);
        if (pending && pending.expiresAt > Date.now()) {
          codeToSend = pending.code;
        }
      }

      let responseText = '';
      if (codeToSend) {
        responseText =
          `<b>Kitto.uz — Tasdiqlash kodi</b>\n\n` +
          `Assalomu alaykum, <b>${escapeHtml(fromUser?.first_name || 'kitobxon')}</b>!\n\n` +
          `Sizning saytga kirish tasdiqlash kodingiz:\n\n` +
          `<b><code>${codeToSend}</code></b>\n\n` +
          `<i>Ushbu 6 xonali kodni Kitto saytidagi oynaga kiriting va hisobingizga kiring.</i>`;
      } else {
        responseText =
          `<b>Kitto.uz platformasi botiga xush kelibsiz!</b>\n\n` +
          `Saytda roʻyxatdan oʻtayotganingizda tasdiqlash kodi shu yerga keladi.\n\n` +
          `<b>Sayt:</b> https://kitto-fakv.vercel.app\n` +
          `<b>Support:</b> @${SUPPORT_TELEGRAM}`;
      }

      await sendMessage(chatId, responseText);
      return NextResponse.json({ ok: true });
    }

    // Default reply for admin
    if (isAdmin) {
      await sendMessage(
        chatId,
        `<b>Kitto Boshqaruv Paneli</b>\n\nQuyidagi tugmalardan birini tanlang:`,
        getAdminKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ ok: true });
  }
}

function getAdminKeyboard() {
  return {
    keyboard: [
      [{ text: 'Sayt statistikasi' }],
      [{ text: 'Support maʼlumotlari' }, { text: 'Saytni ochish' }],
    ],
    resize_keyboard: true,
    persistent: true,
  };
}

async function sendMessage(chatId: number | string, text: string, replyMarkup?: any) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
  } catch (e) {
    console.warn('[Telegram Send Message Warning]:', e);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
