import { Metadata } from 'next';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { BookClientView } from './BookClientView';

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
  const rawBook = id ? await getBook(id) : null;

  const book = rawBook ? {
    id: String(rawBook.id),
    title: String(rawBook.title),
    author: String(rawBook.author),
    category: String(rawBook.category || 'Badiiy adabiyot'),
    condition: rawBook.condition || 'Yaxshi',
    description: rawBook.description || undefined,
    coverUrl: rawBook.cover_url || '',
    ownerId: String(rawBook.owner_id || ''),
    ownerName: String(rawBook.owner_name || 'Kitobxon'),
    ownerContact: String(rawBook.owner_contact || ''),
    city: String(rawBook.city || 'Toshkent shahri'),
    location: {
      lat: rawBook.lat || 41.311081,
      lng: rawBook.lng || 69.240562,
      addressText: rawBook.address_text || rawBook.city || 'Toshkent shahri',
    },
    swapTerm: rawBook.swap_term || {
      type: rawBook.type === 'gift' ? 'gift' : 'permanent',
      durationLabel: rawBook.type === 'gift' ? "Bepul sovg'a" : "Doimiy almashuv",
    },
    status: rawBook.status || 'active',
    createdAt: rawBook.created_at || new Date().toISOString(),
  } : null;

  return <BookClientView initialBook={book as any} bookId={id} />;
}
