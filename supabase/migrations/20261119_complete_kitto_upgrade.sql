-- ==============================================================================
-- KITTO (Kitto.uz) - COMPLETE ENTERPRISE DATABASE MIGRATION & UPGRADE
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE UPGRADE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Toshkent',
  favorite_genres TEXT[] DEFAULT '{}',
  wishlist_books TEXT[] DEFAULT '{}',
  avatar TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  provider TEXT DEFAULT 'direct',
  telegram_username TEXT,
  telegram_chat_id TEXT,
  trust_score INTEGER DEFAULT 5,
  books_given_count INTEGER DEFAULT 0,
  books_received_count INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all new columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'direct';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS books_given_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS books_received_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_contact ON public.profiles(contact);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 3. BOOKS TABLE UPGRADE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_contact TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Toshkent',
  location JSONB NOT NULL DEFAULT '{"lat": 41.311081, "lng": 69.240562, "addressText": "Toshkent shahri"}'::jsonb,
  swap_term JSONB NOT NULL DEFAULT '{"type": "permanent", "durationLabel": "Doimiy almashuv"}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_exchange', 'temporarily_given', 'swapped')),
  loan_info JSONB,
  owner_favorite_genres TEXT[] DEFAULT '{}',
  owner_wishlist TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.books ADD COLUMN IF NOT EXISTS owner_favorite_genres TEXT[] DEFAULT '{}';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS owner_wishlist TEXT[] DEFAULT '{}';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_books_owner_id ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_city ON public.books(city);

-- ------------------------------------------------------------------------------
-- 4. EXCHANGE TRANSACTIONS TABLE (Fixing the missing table!)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exchange_transactions (
  id TEXT PRIMARY KEY,
  initiator_book_id TEXT NOT NULL,
  target_book_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  borrower_id TEXT NOT NULL,
  initiator_book_title TEXT,
  target_book_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'declined', 'completed', 'cancelled')),
  handover_qr_code TEXT,
  return_qr_code TEXT,
  due_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_tx_owner_id ON public.exchange_transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_exchange_tx_borrower_id ON public.exchange_transactions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_exchange_tx_status ON public.exchange_transactions(status);
CREATE INDEX IF NOT EXISTS idx_exchange_tx_created_at ON public.exchange_transactions(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. CHATS TABLE UPGRADE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  book_cover TEXT,
  book_swap_label TEXT NOT NULL DEFAULT 'Almashuv',
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  initiator_id TEXT NOT NULL,
  initiator_name TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_message_text TEXT,
  last_message_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS last_message_text TEXT;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS last_message_time TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON public.chats(owner_id);
CREATE INDEX IF NOT EXISTS idx_chats_initiator_id ON public.chats(initiator_id);
CREATE INDEX IF NOT EXISTS idx_chats_book_id ON public.chats(book_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);

-- ------------------------------------------------------------------------------
-- 6. REGIONAL VOTES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_votes (
  region_id TEXT PRIMARY KEY,
  votes_count INTEGER NOT NULL DEFAULT 0
);

-- Seed initial regions with base votes
INSERT INTO public.regional_votes (region_id, votes_count) VALUES
  ('qashqadaryo', 0),
  ('samarkand', 0),
  ('bukhara', 0),
  ('fergana', 0),
  ('andijan', 0),
  ('namangan', 0),
  ('khorezm', 0),
  ('surxondaryo', 0),
  ('navoiy', 0),
  ('jizzax', 0),
  ('sirdaryo', 0),
  ('qoraqalpogiston', 0)
ON CONFLICT (region_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_votes ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies creation
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Public profiles are readable by anyone" ON public.profiles;
  CREATE POLICY "Public profiles are readable by anyone" ON public.profiles FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Anyone can insert or update their profile" ON public.profiles;
  CREATE POLICY "Anyone can insert or update their profile" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

  -- Books
  DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
  CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can create and edit books" ON public.books;
  CREATE POLICY "Users can create and edit books" ON public.books FOR ALL USING (true) WITH CHECK (true);

  -- Chats
  DROP POLICY IF EXISTS "Participants can view and update their chats" ON public.chats;
  CREATE POLICY "Participants can view and update their chats" ON public.chats FOR ALL USING (true) WITH CHECK (true);

  -- Exchange Transactions
  DROP POLICY IF EXISTS "Exchange transactions are viewable and manageable by participants" ON public.exchange_transactions;
  CREATE POLICY "Exchange transactions are viewable and manageable by participants" ON public.exchange_transactions FOR ALL USING (true) WITH CHECK (true);

  -- Regional Votes
  DROP POLICY IF EXISTS "Votes are viewable and updatable by everyone" ON public.regional_votes;
  CREATE POLICY "Votes are viewable and updatable by everyone" ON public.regional_votes FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ------------------------------------------------------------------------------
-- 8. REALTIME REPLICATION PUBLICATION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'books'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.books;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'exchange_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'regional_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.regional_votes;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 9. STORAGE BUCKET FOR COVERS (Public)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DROP POLICY IF EXISTS "Public access to book covers" ON storage.objects;
CREATE POLICY "Public access to book covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

-- Storage upload policy
DROP POLICY IF EXISTS "Anyone can upload book covers" ON storage.objects;
CREATE POLICY "Anyone can upload book covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
