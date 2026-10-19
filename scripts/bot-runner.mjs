// ==============================================================================
// Kitto.uz — Telegram Bot Runner (Terminal Polling Service)
// ==============================================================================

const BOT_TOKEN = '8890224721:AAGaspC6qK7ferPtSJ9Bm2HSe5osfGHrsQM';
const ADMIN_CHAT_ID = 5111794979;
const ADMIN_USERNAME = 'svrvc';
const ADMIN_PHONE = '+998337533373';
const SUPPORT_PHONE = '+998337533373';
const SUPPORT_TELEGRAM = 'kitto_support';
const SITE_URL = 'https://kitto-fakv.vercel.app';

const SUPABASE_URL = 'https://ncggomxerhwlnoqzdxch.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8-c0S1elxWAA4ImffuX2OA_nulW_wIn';

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Admin Keyboard
const ADMIN_KEYBOARD = {
  keyboard: [
    [{ text: '📊 Sayt statistikasi' }],
    [{ text: 'ℹ️ Support maʼlumotlari' }, { text: '🌐 Saytni ochish' }],
  ],
  resize_keyboard: true,
  persistent: true,
};

async function getLiveStats() {
  let usersCount = 0;
  let booksCount = 0;
  let activeBooks = 0;
  let swappedBooks = 0;
  let temporaryBooks = 0;
  let votesCount = 0;

  try {
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    };

    // Profiles
    const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, {
      headers: { ...headers, Range: '0-0', Prefer: 'count=exact' },
    });
    const pRange = pRes.headers.get('content-range');
    if (pRange) usersCount = parseInt(pRange.split('/')[1]) || 0;

    // Books
    const bRes = await fetch(`${SUPABASE_URL}/rest/v1/books?select=status`, {
      headers,
    });
    if (bRes.ok) {
      const books = await bRes.json();
      if (Array.isArray(books)) {
        booksCount = books.length;
        activeBooks = books.filter((b) => b.status === 'active').length;
        swappedBooks = books.filter((b) => b.status === 'swapped').length;
        temporaryBooks = books.filter((b) => b.status === 'temporarily_given').length;
      }
    }

    // Regional votes
    const vRes = await fetch(`${SUPABASE_URL}/rest/v1/regional_votes?select=votes_count`, {
      headers,
    });
    if (vRes.ok) {
      const votes = await vRes.json();
      if (Array.isArray(votes)) {
        votesCount = votes.reduce((acc, r) => acc + (Number(r.votes_count) || 0), 0);
      }
    }
  } catch (e) {
    console.warn('[Stats error]:', e.message);
  }

  const now = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    `📊 <b>KITTO.UZ — SAYT STATISTIKASI</b>\n\n` +
    `👥 <b>Jami foydalanuvchilar:</b> ${usersCount} nafar\n` +
    `📚 <b>Jami kitoblar:</b> ${booksCount} ta\n` +
    `   • 🟢 <b>Faol eʼlonlar:</b> ${activeBooks} ta\n` +
    `   • 🔄 <b>Almashilgan:</b> ${swappedBooks} ta\n` +
    `   • ⏳ <b>Vaqtincha mutolaada:</b> ${temporaryBooks} ta\n\n` +
    `📍 <b>Viloyatlar boʻyicha ovozlar:</b> ${votesCount} ta\n` +
    `⏰ <b>Yangilangan:</b> ${now}\n\n` +
    `<i>Boshqaruv: @${ADMIN_USERNAME}</i>`
  );
}

async function sendMessage(chatId, text, replyMarkup) {
  try {
    const res = await fetch(`${TG_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error(`[Send error to ${chatId}]:`, err.message);
    return false;
  }
}

async function processUpdate(update) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat?.id;
  const from = message.from;
  const text = (message.text || '').trim();
  const username = from?.username ? from.username.toLowerCase() : '';
  const firstName = from?.first_name || 'Kitobxon';

  console.log(`[Update] from: @${username || from?.id} (${chatId}): "${text}"`);

  const isAdmin = chatId === ADMIN_CHAT_ID || username === ADMIN_USERNAME.toLowerCase();

  // 1. Stats Request
  if (text === '/stats' || text.includes('Statistika') || text.includes('statistika')) {
    const statsText = await getLiveStats();
    await sendMessage(chatId, statsText, isAdmin ? ADMIN_KEYBOARD : undefined);
    return;
  }

  // 2. Support Info
  if (text === '/support' || text === '/help' || text.includes('Support') || text.includes('Yordam')) {
    const supportText =
      `ℹ️ <b>Kitto.uz — Qoʻllab-quvvatlash xizmati</b>\n\n` +
      `Qandaydir savol va takliflar boʻlsa, biz bilan bogʻlaning:\n\n` +
      `📞 <b>Telefon:</b> <code>${SUPPORT_PHONE}</code>\n` +
      `✈️ <b>Telegram:</b> @${SUPPORT_TELEGRAM}\n\n` +
      `<i>Biz har doim yordam berishga tayyormiz!</i>`;
    await sendMessage(chatId, supportText, isAdmin ? ADMIN_KEYBOARD : undefined);
    return;
  }

  // 3. Open Website
  if (text.includes('Saytni ochish') || text === '/site' || text.toLowerCase() === 'sayt') {
    const siteText =
      `🌐 <b>Kitto.uz Rasmiy Sayti:</b>\n\n` +
      `Kitob almashish va mutolaa maydoni:\n` +
      `👉 ${SITE_URL}\n\n` +
      `<i>Kitoblar olamiga xush kelibsiz!</i>`;
    await sendMessage(chatId, siteText, {
      inline_keyboard: [[{ text: '🌐 Saytga oʻtish', url: SITE_URL }]],
    });
    return;
  }

  // 4. /start Command
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const payload = parts[1]?.trim();

    // Verification code sent via deeplink
    if (payload && (/^\d{6}$/.test(payload) || payload.startsWith('code_'))) {
      const code = payload.replace('code_', '');
      const codeText =
        `📚 <b>Kitto.uz — Tasdiqlash kodi</b>\n\n` +
        `Assalomu alaykum, <b>${escapeHtml(firstName)}</b>!\n\n` +
        `Sizning saytga kirish tasdiqlash kodingiz:\n\n` +
        `👉 <b><code>${code}</code></b>\n\n` +
        `<i>Ushbu 6 xonali kodni Kitto saytidagi oynaga kiriting va hisobingizga kiring.</i>`;
      await sendMessage(chatId, codeText);
      return;
    }

    if (isAdmin) {
      const adminGreeting =
        `👑 <b>Assalomu alaykum, Admin Parviz (@${ADMIN_USERNAME})!</b>\n\n` +
        `Siz Kitto.uz platformasi boshqaruvchisiz.\n` +
        `Terminal boti faol ishlamoqda va Telegramingizga ulandi.\n\n` +
        `Yangi foydalanuvchilar va sayt statistikasi toʻgʻridan-toʻgʻri shu yerda aks etadi.\n\n` +
        `Statistikani koʻrish uchun pastdagi <b>📊 Sayt statistikasi</b> tugmasini bosing:`;

      await sendMessage(chatId, adminGreeting, ADMIN_KEYBOARD);
      return;
    }

    // Normal User Welcome
    const welcome =
      `📚 <b>Kitto.uz platformasi botiga xush kelibsiz!</b>\n\n` +
      `Assalomu alaykum, <b>${escapeHtml(firstName)}</b>!\n\n` +
      `Ushbu bot orqali saytga kirish tasdiqlash kodlari va kitoblaringizga kelgan yangi takliflar haqida bildirishnomalar olasiz.\n\n` +
      `🌐 <b>Sayt:</b> ${SITE_URL}\n` +
      `📞 <b>Support:</b> @${SUPPORT_TELEGRAM}`;

    await sendMessage(chatId, welcome);
    return;
  }

  // Default response
  if (isAdmin) {
    await sendMessage(
      chatId,
      `👑 <b>Kitto Boshqaruv Paneli</b>\n\nQuyidagi tugmalardan birini tanlang:`,
      ADMIN_KEYBOARD
    );
  } else {
    await sendMessage(
      chatId,
      `📚 <b>Kitto.uz boti</b>\n\nSaytni ochish uchun: ${SITE_URL}\nQoʻllab-quvvatlash: @${SUPPORT_TELEGRAM}`
    );
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function startPolling() {
  console.log('----------------------------------------------------');
  console.log('🤖 Kitto.uz Telegram Bot Runner ishga tushdi!');
  console.log(`👑 Admin: @${ADMIN_USERNAME} (Chat ID: ${ADMIN_CHAT_ID})`);
  console.log(`🤖 Bot: @kittouzbot`);
  console.log('----------------------------------------------------');

  let offset = 0;

  // Initial greeting notification to admin in Telegram
  try {
    await sendMessage(
      ADMIN_CHAT_ID,
      `⚡ <b>Kitto Bot terminalda ishga tushdi!</b>\n\nAssalomu alaykum @${ADMIN_USERNAME}! Bot buyruqlarni qabul qilishga tayyor.\n\nStatistika uchun pastdagi tugmani bosing:`,
      ADMIN_KEYBOARD
    );
  } catch (err) {
    console.warn('[Initial greeting error]:', err.message);
  }

  while (true) {
    try {
      const res = await fetch(`${TG_API}/getUpdates?offset=${offset}&timeout=25`);
      if (!res.ok) {
        console.warn(`[getUpdates HTTP ${res.status}] retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await processUpdate(update);
        }
      }
    } catch (e) {
      console.error('[Polling Loop Error]:', e.message);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

startPolling();
