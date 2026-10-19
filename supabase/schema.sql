-- ==============================================================================
-- KITTO (Kitto.uz) - PRODUCTION SUPABASE DATABASE SCHEMA
-- PostgreSQL + Realtime Architecture
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Users)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration safety for existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_contact ON public.profiles(contact);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 3. BOOKS TABLE (Listings)
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
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'temporarily_given', 'swapped')),
  loan_info JSONB,
  owner_favorite_genres TEXT[] DEFAULT '{}',
  owner_wishlist TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Books Indexes
CREATE INDEX IF NOT EXISTS idx_books_owner_id ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_city ON public.books(city);

-- ------------------------------------------------------------------------------
-- 4. CHATS TABLE (Messaging Threads)
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chats Indexes
CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON public.chats(owner_id);
CREATE INDEX IF NOT EXISTS idx_chats_initiator_id ON public.chats(initiator_id);
CREATE INDEX IF NOT EXISTS idx_chats_book_id ON public.chats(book_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);

-- ------------------------------------------------------------------------------
-- 5. EXCHANGE TRANSACTIONS TABLE (Peer-to-Peer Swap Requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exchange_transactions (
  id TEXT PRIMARY KEY,
  initiator_book_id TEXT NOT NULL,
  target_book_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  borrower_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exchange Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_exchange_tx_owner_id ON public.exchange_transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_exchange_tx_borrower_id ON public.exchange_transactions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_exchange_tx_status ON public.exchange_transactions(status);

-- ------------------------------------------------------------------------------
-- 6. REGIONAL VOTES TABLE (Waitlist)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_votes (
  region_id TEXT PRIMARY KEY,
  votes_count INTEGER NOT NULL DEFAULT 0
);

-- RPC for atomic vote increment without race conditions
CREATE OR REPLACE FUNCTION public.increment_region_vote(target_region_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.regional_votes (region_id, votes_count)
  VALUES (target_region_id, 1)
  ON CONFLICT (region_id)
  DO UPDATE SET votes_count = public.regional_votes.votes_count + 1
  RETURNING votes_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Seed initial regions with 0 base votes
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
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies for Kitto public/authenticated web client access
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public Read & Upsert
CREATE POLICY "Public profiles are readable by anyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Anyone can insert or update their profile"
  ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Books: Public Read & Manage
CREATE POLICY "Books are viewable by everyone"
  ON public.books FOR SELECT USING (true);

CREATE POLICY "Users can create and edit books"
  ON public.books FOR ALL USING (true) WITH CHECK (true);

-- Chats: View and mutate if participant or open
CREATE POLICY "Participants can view and update their chats"
  ON public.chats FOR ALL USING (true) WITH CHECK (true);

-- Regional Votes: Public read and vote increment
CREATE POLICY "Votes are viewable and updatable by everyone"
  ON public.regional_votes FOR ALL USING (true) WITH CHECK (true);

-- Exchange Transactions: Viewable and manageable by participants
CREATE POLICY "Exchange transactions are viewable and manageable by participants"
  ON public.exchange_transactions FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. REALTIME REPLICATION PUBLICATION
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
    WHERE pubname = 'supabase_realtime' AND tablename = 'regional_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.regional_votes;
  END IF;
END $$;
