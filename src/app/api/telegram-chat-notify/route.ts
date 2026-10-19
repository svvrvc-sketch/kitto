import { NextResponse } from 'next/server';
import { TELEGRAM_BOT_TOKEN, getUserChatId, normalizeUsername, normalizePhone } from '@/lib/telegram-auth';
import { getAdminChatId, ADMIN_USERNAME, ADMIN_PHONE } from '@/lib/telegram-admin';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientId,
      recipientName,
      senderName,
      bookTitle,
      messageSnippet,
      threadId,
    } = body;

    if (!recipientName || !senderName || !bookTitle) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Site deal URL
    const siteUrl = 'https://kitto-fakv.vercel.app';
    const dealUrl = threadId ? `${siteUrl}/?chat=${encodeURIComponent(threadId)}` : siteUrl;

    const pushText =
      `📬 <b>Kitto.uz — Yangi taklif / Xabar!</b>\n\n` +
      `Hurmatli <b>${escapeHtml(recipientName)}</b>, sizning <b>"${escapeHtml(bookTitle)}"</b> kitobingizga <b>${escapeHtml(senderName)}</b> almashish taklifini / xabar yubordi!\n\n` +
      (messageSnippet ? `💬 <i>"${escapeHtml(messageSnippet.slice(0, 150))}"</i>\n\n` : '') +
      `👉 <a href="${dealUrl}">Taklifni koʻrish va javob berish</a>\n\n` +
      `<i>Kitto platformasi bildirishnomasi</i>`;

    const targetChatIds = new Set<string | number>();

    // 1. Try to find recipient's chat ID in Supabase profiles
    if (recipientId && supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
      try {
        const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
        const { data: profile } = await client
          .from('profiles')
          .select('telegram_chat_id, telegram_username, contact')
          .eq('id', recipientId)
          .maybeSingle();

        if (profile?.telegram_chat_id) {
          targetChatIds.add(profile.telegram_chat_id);
        } else {
          if (profile?.telegram_username) {
            const registered = getUserChatId(normalizeUsername(profile.telegram_username));
            if (registered) targetChatIds.add(registered);
          }
          if (profile?.contact) {
            const registeredPhone = getUserChatId(normalizePhone(profile.contact));
            if (registeredPhone) targetChatIds.add(registeredPhone);
          }
        }
      } catch (err) {
        console.warn('[Chat Notify Profile Fetch Error]:', err);
      }
    }

    // 2. If recipient is admin (@svrvc) or if no specific chat ID found, also alert admin
    const adminChatId = getAdminChatId();
    if (adminChatId) {
      targetChatIds.add(adminChatId);
    }

    if (targetChatIds.size === 0) {
      // Check in-memory registrations for admin
      const svrvcChat = getUserChatId(ADMIN_USERNAME) || getUserChatId(ADMIN_PHONE);
      if (svrvcChat) targetChatIds.add(svrvcChat);
    }

    let sent = false;
    for (const chatId of Array.from(targetChatIds)) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: pushText,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📖 Saytda koʻrish', url: dealUrl }],
              ],
            },
          }),
        });
        if (res.ok) sent = true;
      } catch (e) {
        console.warn(`[Failed to push Telegram chat notice to ${chatId}]:`, e);
      }
    }

    return NextResponse.json({ ok: true, sent, count: targetChatIds.size });
  } catch (error: any) {
    console.error('[telegram-chat-notify error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
