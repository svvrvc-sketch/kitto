import { Metadata } from 'next';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, MapPin, Share2 } from 'lucide-react';

interface PageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function getBook(id: string) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    return null;
  }
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const { data } = await client
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = params?.id;
  const book = id ? await getBook(id) : null;

  const defaultTitle = 'Kitto.uz — Toshkentda kitob almashing';
  const defaultDesc = 'Kitoblarni bepul almashing, vaqtincha oʻqishga oling yoki javoningizdagi kitoblarni boshqalar bilan ulashing.';
  const defaultImage = 'https://kitto.uz/og-image.jpg';

  if (!book) {
    return {
      title: defaultTitle,
      description: defaultDesc,
      openGraph: {
        title: defaultTitle,
        description: defaultDesc,
        images: [{ url: defaultImage, width: 1200, height: 630 }],
      },
    };
  }

  const title = `${book.title} — ${book.author} | Kitto.uz`;
  const description = `Kitto.uz — Toshkentda kitob almashing. ${book.title} (${book.author}). Holati: ${book.condition || 'Yaxshi'}. ${book.city || 'Toshkent'}.`;
  const imageUrl = book.cover_url && book.cover_url.startsWith('http')
    ? book.cover_url
    : defaultImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://kitto-fakv.vercel.app/book/${id}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1066,
          alt: book.title,
        },
      ],
      siteName: 'Kitto.uz',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BookSharePage({ params }: PageProps) {
  const id = params?.id;
  const book = id ? await getBook(id) : null;

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-editorial p-6 sm:p-7 text-center">
        {book ? (
          <>
            <div className="relative aspect-[3/4] w-40 mx-auto rounded-2xl overflow-hidden shadow-book mb-5 border border-stone-200 dark:border-zinc-700 bg-stone-100">
              {book.cover_url && book.cover_url.startsWith('http') ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs font-semibold mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{book.swap_term?.durationLabel || 'Almashuv'}</span>
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-tight mb-1 text-stone-900 dark:text-stone-100">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-stone-500 dark:text-zinc-400 mb-3">
              {book.author}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 mb-6">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{book.location?.addressText || book.city || 'Toshkent'}</span>
            </div>

            <div className="space-y-2.5">
              <Link
                href={`/?book=${encodeURIComponent(id)}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 font-bold text-xs tracking-wide shadow-tactile transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Kitobni ochish va bogʻlanish</span>
              </Link>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(`https://kitto-fakv.vercel.app/book/${id}`)}&text=${encodeURIComponent(`Kitto.uz da ushbu ajoyib kitobni koʻring: "${book.title}" (${book.author})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs text-stone-700 dark:text-stone-300 font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Telegramda ulashish</span>
              </a>
            </div>
          </>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              📖
            </div>
            <h2 className="font-serif text-lg font-bold mb-1.5 text-stone-900 dark:text-stone-100">Kitob eʼloni</h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5 max-w-xs mx-auto">
              Kitobni toʻliq koʻrish, egasi bilan bogʻlanish yoki almashish uchun platformani oching.
            </p>
            <div className="space-y-2">
              <Link
                href={`/?book=${encodeURIComponent(id)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#141413] hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-white text-[#F8F7F4] dark:text-stone-900 text-xs font-bold shadow-tactile transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Kitobni platformada koʻrish</span>
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Bosh sahifa</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
