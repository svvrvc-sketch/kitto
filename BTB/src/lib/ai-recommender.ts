export interface AiRecommendation {
  id: string;
  title: string;
  author: string;
  category: string;
  reason: string;
  badge: string;
}

const SELF_DEV_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: 'sd-1',
    title: 'Fikrlash, tez va sekin',
    author: 'Daniel Kahneman',
    category: 'Psixologiya',
    reason: 'Qaror qabul qilish mexanizmlari va tafakkur xatolarini ochib beradi',
    badge: '🎯 Mos keladi',
  },
  {
    id: 'sd-2',
    title: 'Diqqat: Chalgʻituvchi dunyoda muvaffaqiyat sirlari',
    author: 'Kal Nyuport',
    category: 'Samaradorlik',
    reason: 'Odatlarni chuqur konsentratsiya va natijaga aylantirish uchun',
    badge: '🔥 Bestseller',
  },
  {
    id: 'sd-3',
    title: 'Dunyoni tebratgan 7 odat',
    author: 'Stiven Kovi',
    category: 'Liderlik',
    reason: 'Shaxsiy va kasbiy rivojlanishning oltin klassikasi',
    badge: '⭐ Tavsiya',
  },
  {
    id: 'sd-4',
    title: 'Turtki (Nudge): Toʻgʻri qarorlar qabul qilish',
    author: 'Richard Taler',
    category: 'Iqtisodiyot',
    reason: 'Inson psixologiyasi va atrof-muhit taʼsirini tushunish uchun',
    badge: '💡 Yangicha qarash',
  },
  {
    id: 'sd-5',
    title: 'Kichik qadamlar — buyuk natijalar (Kaizen)',
    author: 'Robert Maurer',
    category: 'Shaxsiy rivojlanish',
    reason: 'Ogʻriqsiz va doimiy oʻsish uchun yapon falsafasi',
    badge: '🌱 Oson odatlar',
  },
];

const IT_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: 'it-1',
    title: 'Clean Architecture (Toza arxitektura)',
    author: 'Robert C. Martin',
    category: 'IT & Arxitektura',
    reason: 'Clean Code kitobining mantiqiy davomi — tizimli dastur tuzilmasi',
    badge: '🎯 Professional',
  },
  {
    id: 'it-2',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Tizimlar & Backend',
    reason: 'Katta yuklamali maʼlumotlar va taqsimlangan tizimlar standarti',
    badge: '🔥 IT Must-Read',
  },
  {
    id: 'it-3',
    title: 'Grokking Algorithms (Algoritmlarni anglash)',
    author: 'Aditya Bhargava',
    category: 'Algoritmlar',
    reason: 'Vizual misollar orqali murakkab algoritmlarni sodda tushunish',
    badge: '⭐ Ommabop',
  },
  {
    id: 'it-4',
    title: 'Refactoring: Mavjud kodni yaxshilash',
    author: 'Martin Fowler',
    category: 'Kod sifati',
    reason: 'Kodni buzmasdan tozalash va unumdorligini oshirish amaliyoti',
    badge: '💡 Amaliy',
  },
  {
    id: 'it-5',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    category: 'Dasturlash falsafasi',
    reason: 'Dasturchilikdan usta hunarmand darajasiga oʻtish sirlari',
    badge: '🚀 Mumtoz',
  },
];

const UZBEK_LIT_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: 'uz-1',
    title: 'Mehrobdan chayon',
    author: 'Abdulla Qodiriy',
    category: 'Oʻzbek adabiyoti',
    reason: 'Oʻtkan kunlar muallifidan yana bir tengsiz tarixiy roman',
    badge: '🎯 Mumtoz durdona',
  },
  {
    id: 'uz-2',
    title: 'Kecha va kunduz',
    author: 'Abdulhamid Choʻlpon',
    category: 'Jadid adabiyoti',
    reason: 'Oʻzbek nasrining choʻqqisi, xalq hayoti va erkinlik nafasi',
    badge: '⭐ Shah asar',
  },
  {
    id: 'uz-3',
    title: 'Yulduzli tunlar (Bobur)',
    author: 'Pirimqul Qodirov',
    category: 'Tarixiy roman',
    reason: 'Zahiriddin Muhammad Boburning shonli va fojiali hayot yoʻli',
    badge: '👑 Tarixiy',
  },
  {
    id: 'uz-4',
    title: 'Sariq devni minib',
    author: 'Xudoyberdi Toʻxtaboyev',
    category: 'Sarguzasht',
    reason: 'Hozirjavoblik, samimiyat va maroqli sarguzashtlar kitobi',
    badge: '✨ Sevimli',
  },
  {
    id: 'uz-5',
    title: 'Ufq (Trilogiya)',
    author: 'Said Ahmad',
    category: 'Klassika',
    reason: 'Urush va undan keyingi oʻzbek xalqining matonati',
    badge: '📖 Chuqur maʼno',
  },
];

const WORLD_LIT_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: 'wl-1',
    title: 'Molxona (Animal Farm)',
    author: 'Jorj Oruell',
    category: 'Antiutopiya',
    reason: '1984 romanining muallifidan eng mashhur satirik ertak-roman',
    badge: '🎯 100% Mos',
  },
  {
    id: 'wl-2',
    title: 'Farengeyt boʻyicha 451 daraja',
    author: 'Rey Bredberi',
    category: 'Fantastika',
    reason: 'Kitoblar taqiqlangan dunyoda tafakkur uchun kurash',
    badge: '🔥 Bestseller',
  },
  {
    id: 'wl-3',
    title: 'Ajib yangi dunyo (Brave New World)',
    author: 'Oldos Xaksli',
    category: 'Klassika',
    reason: 'Texnologiya va sunʼiy baxt ustiga qurilgan jamiyat fojiasi',
    badge: '⭐ Falsafiy',
  },
  {
    id: 'wl-4',
    title: 'Alkimyogar',
    author: 'Paulo Koelo',
    category: 'Falsafiy qissa',
    reason: 'Orzular ortidan borish va inson oʻz taqdirini yaratishi haqida',
    badge: '✨ Ilhomlantiruvchi',
  },
  {
    id: 'wl-5',
    title: 'Begona (L\'Étranger)',
    author: 'Alber Kamyu',
    category: 'Ekzistensializm',
    reason: 'Nobel mukofoti sovrindoridan inson ruhiyatining chuqur fojiasi',
    badge: '💡 Dunyoqarash',
  },
];

const BUSINESS_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: 'biz-1',
    title: 'Nol dan birgacha (Zero to One)',
    author: 'Piter Til',
    category: 'Startap & Biznes',
    reason: 'Kelajakni yaratuvchi yangi loyihalar va monopoliya falsafasi',
    badge: '🚀 Startap',
  },
  {
    id: 'biz-2',
    title: 'Psixologiya va pul',
    author: 'Morgan Hausel',
    category: 'Moliya psixologiyasi',
    reason: 'Boylik siri matematikada emas, inson xulq-atvorida ekanligi haqida',
    badge: '🔥 Top Tavsiya',
  },
  {
    id: 'biz-3',
    title: 'Eng boy odam Bobilda',
    author: 'Jorj Kleyson',
    category: 'Moliyaviy savodxonlik',
    reason: 'Tejamkorlik va kapital toʻplashning asrlar sinovidan oʻtgan qoidalari',
    badge: '💰 Mumtoz',
  },
  {
    id: 'biz-4',
    title: 'Aqlli investor (The Intelligent Investor)',
    author: 'Benjamin Grem',
    category: 'Investitsiya',
    reason: 'Uorren Baffetning sevimli stoik investitsiya qoʻllanmasi',
    badge: '⭐ Fundamental',
  },
  {
    id: 'biz-5',
    title: 'Stiv Jobs',
    author: 'Uolter Ayzekson',
    category: 'Biografiya',
    reason: 'Texnologiya va dizaynni birlashtirgan daho hayot yoʻli',
    badge: '🍎 Biografiya',
  },
];

const GENERAL_POPULAR: AiRecommendation[] = [
  {
    id: 'gen-1',
    title: 'Atom odatlar (Atomic Habits)',
    author: 'Jeyms Klir',
    category: 'Shaxsiy rivojlanish',
    reason: 'Oʻzbekistonda eng koʻp soʻraladigan va oʻqiladigan kitob',
    badge: '🔥 Top Almashinuv',
  },
  {
    id: 'gen-2',
    title: 'Fikrlash, tez va sekin',
    author: 'Daniel Kahneman',
    category: 'Psixologiya',
    reason: 'Har qanday kitobxon uchun yuqori qiymatga ega aql charxi',
    badge: '🧠 Intellektual',
  },
  {
    id: 'gen-3',
    title: '1984',
    author: 'Jorj Oruell',
    category: 'Klassika',
    reason: 'Dunyo miqyosidagi doimiy dolzarb asar',
    badge: '⭐ Bestseller',
  },
  {
    id: 'gen-4',
    title: 'Oʻtkan kunlar',
    author: 'Abdulla Qodiriy',
    category: 'Milliy adabiyot',
    reason: 'Oʻzbek xalqining eng qadrli badiiy yodgorligi',
    badge: '💎 Durdona',
  },
  {
    id: 'gen-5',
    title: 'Nol dan birgacha',
    author: 'Piter Til',
    category: 'Biznes',
    reason: 'Tadbirkorlik va yangilik yaratish boʻyicha eng yaxshi qoʻllanma',
    badge: '🚀 Istiqbolli',
  },
];

/**
 * Smart Contextual AI Recommender Engine
 * Analyzes the title and author provided by user and determines optimal swap recommendations.
 */
export function getAiSwapRecommendations(
  currentBookTitle: string = '',
  currentBookAuthor: string = '',
  categoryFilter?: string
): AiRecommendation[] {
  const query = `${currentBookTitle} ${currentBookAuthor}`.toLowerCase();

  // If explicit genre requested
  if (categoryFilter) {
    switch (categoryFilter) {
      case 'it':
        return IT_RECOMMENDATIONS;
      case 'self-dev':
        return SELF_DEV_RECOMMENDATIONS;
      case 'uzbek':
        return UZBEK_LIT_RECOMMENDATIONS;
      case 'world':
        return WORLD_LIT_RECOMMENDATIONS;
      case 'business':
        return BUSINESS_RECOMMENDATIONS;
      default:
        break;
    }
  }

  // 1. Check for IT / Programming
  if (
    query.includes('clean') ||
    query.includes('code') ||
    query.includes('dastur') ||
    query.includes('python') ||
    query.includes('java') ||
    query.includes('react') ||
    query.includes('algoritm') ||
    query.includes('martin') ||
    query.includes('architect') ||
    query.includes('data') ||
    query.includes('developer')
  ) {
    return IT_RECOMMENDATIONS;
  }

  // 2. Check for Self-Development / Habits
  if (
    query.includes('atom') ||
    query.includes('odat') ||
    query.includes('klir') ||
    query.includes('clear') ||
    query.includes('habit') ||
    query.includes('vaqt') ||
    query.includes('samara') ||
    query.includes('intizom') ||
    query.includes('diqqat') ||
    query.includes('psixologiya') ||
    query.includes('rivojlanish') ||
    query.includes('muvaffaqiyat')
  ) {
    return SELF_DEV_RECOMMENDATIONS;
  }

  // 3. Check for Uzbek literature
  if (
    query.includes('qodiriy') ||
    query.includes('otkan') ||
    query.includes('o\'tkan') ||
    query.includes('oʻtkan') ||
    query.includes('mehrobdan') ||
    query.includes('chayon') ||
    query.includes('cho\'lpon') ||
    query.includes('navoiy') ||
    query.includes('qodirov') ||
    query.includes('bobur') ||
    query.includes('said ahmad') ||
    query.includes('to\'xtaboyev')
  ) {
    return UZBEK_LIT_RECOMMENDATIONS;
  }

  // 4. Check for World Literature / Classics / Dystopia
  if (
    query.includes('1984') ||
    query.includes('oruell') ||
    query.includes('orwell') ||
    query.includes('molxona') ||
    query.includes('bredberi') ||
    query.includes('farengeyt') ||
    query.includes('alkimyogar') ||
    query.includes('koelo') ||
    query.includes('kamyu') ||
    query.includes('dostoyevsk') ||
    query.includes('tolstoy') ||
    query.includes('antiutopiya')
  ) {
    return WORLD_LIT_RECOMMENDATIONS;
  }

  // 5. Check for Business / Money / Investing
  if (
    query.includes('boy') ||
    query.includes('ota') ||
    query.includes('kiyosaki') ||
    query.includes('pul') ||
    query.includes('invest') ||
    query.includes('moliya') ||
    query.includes('biznes') ||
    query.includes('kapital') ||
    query.includes('startup') ||
    query.includes('startap') ||
    query.includes('jobs') ||
    query.includes('til')
  ) {
    return BUSINESS_RECOMMENDATIONS;
  }

  // Fallback: General high-value suggestions
  return GENERAL_POPULAR;
}
