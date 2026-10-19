import { NextResponse } from 'next/server';
import { notifyAdminNewUser } from '@/lib/telegram-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact, telegramUsername, email, city, provider, id } = body;

    // Dispatch rich structured notification to Admin
    await notifyAdminNewUser({
      name: name || 'Foydalanuvchi',
      contact: contact || 'Kiritilmagan',
      telegramUsername,
      email,
      city: city || 'Toshkent',
      provider: provider || 'Sayt orqali',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Telegram Notify Route Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
