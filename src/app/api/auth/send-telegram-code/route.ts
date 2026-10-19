import { NextResponse } from 'next/server';
import {
  createVerificationCode,
  normalizePhone,
  normalizeUsername,
  getUserChatId,
  sendTelegramDirectCode,
  TELEGRAM_BOT_USERNAME,
} from '@/lib/telegram-auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name, username } = body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return NextResponse.json(
        { success: false, error: 'Iltimos, toʻgʻri telefon raqam kiriting' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(phone);
    const cleanUsername = normalizeUsername(username);

    // 1. Create verification code
    const { code, expiresAt, botDeepLink } = createVerificationCode({
      phone: cleanPhone,
      name,
      username: cleanUsername,
    });

    // 2. Try to dispatch directly via bot if user's chat_id is known
    let sentDirectly = false;
    const knownChatId =
      getUserChatId(cleanPhone) ||
      (cleanUsername ? getUserChatId(cleanUsername) : undefined);

    if (knownChatId) {
      sentDirectly = await sendTelegramDirectCode(knownChatId, code, name);
    }

    return NextResponse.json({
      success: true,
      botDeepLink,
      sentDirectly,
      botUsername: TELEGRAM_BOT_USERNAME,
      expiresAt,
      message: sentDirectly
        ? 'Tasdiqlash kodi Telegram botingizga yuborildi'
        : `Tasdiqlash kodini olish uchun @${TELEGRAM_BOT_USERNAME} ga kiring`,
    });
  } catch (error) {
    console.error('[Send Telegram Code Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
