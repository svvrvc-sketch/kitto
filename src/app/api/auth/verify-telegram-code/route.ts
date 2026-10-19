import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/telegram-auth';
import { notifyAdminNewUser } from '@/lib/telegram-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, code, name, username, email } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Telefon raqam va tasdiqlash kodi talab qilinadi' },
        { status: 400 }
      );
    }

    const result = verifyCode(phone, code);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || 'Notoʻgʻri tasdiqlash kodi' },
        { status: 400 }
      );
    }

    // Notify Admin about new verified user!
    notifyAdminNewUser({
      name: name || 'Foydalanuvchi',
      contact: phone,
      telegramUsername: username,
      email,
      provider: 'Telegram kod orqali',
    }).catch((err) => {
      console.warn('Failed to notify admin:', err);
    });

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('[Verify Telegram Code Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatosi' },
      { status: 500 }
    );
  }
}
