import { NextResponse } from 'next/server';

const BOT_TOKEN = '8890224721:AAGaspC6qK7ferPtSJ9Bm2HSe5osfGHrsQM';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact, email, city, provider } = body;

    const formattedTime = new Date().toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const text =
      `🔔 <b>Yangi foydalanuvchi tizimga kirdi (Kitto.uz)</b>\n\n` +
      `👤 <b>Ism:</b> ${escapeHtml(name || 'Nomaʼlum')}\n` +
      `📞 <b>Aloqa:</b> ${escapeHtml(contact || 'Kiritilmagan')}\n` +
      (email ? `📧 <b>Email:</b> ${escapeHtml(email)}\n` : '') +
      `📍 <b>Hudud:</b> ${escapeHtml(city || 'Toshkent')}\n` +
      `🌐 <b>Kirish turi:</b> ${escapeHtml(provider || "Qo'lda kiritish")}\n` +
      `⏰ <b>Vaqt:</b> ${formattedTime}\n`;

    // 1. Check if an explicit admin chat ID is configured in env
    const explicitChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // 2. Discover recent chat IDs from getUpdates
    const recipientChatIds = new Set<string | number>();
    if (explicitChatId) {
      recipientChatIds.add(explicitChatId);
    }

    try {
      const updatesRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`,
        { cache: 'no-store' }
      );
      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        if (updatesData.ok && Array.isArray(updatesData.result)) {
          for (const item of updatesData.result) {
            const chat =
              item.message?.chat ||
              item.callback_query?.message?.chat ||
              item.channel_post?.chat;
            if (chat && chat.id) {
              recipientChatIds.add(chat.id);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Telegram Notify] Could not fetch getUpdates:', e);
    }

    // 3. Send message to all discovered chat IDs
    if (recipientChatIds.size > 0) {
      for (const chatId of Array.from(recipientChatIds)) {
        try {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: 'HTML',
            }),
          });
        } catch (err) {
          console.warn(`[Telegram Notify] Failed to send to ${chatId}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      notifiedCount: recipientChatIds.size,
    });
  } catch (error) {
    console.error('[Telegram Notify Route Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
