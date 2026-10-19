-- ==============================================================================
-- KITTO (Kitto.uz) - DATABASE MIGRATION: FIX PROFILES SCHEMA & RBAC ROLES
-- Run this in the Supabase SQL Editor if you experience "Could not find 'avatar' column"
-- ==============================================================================

-- 1. Ensure avatar and avatar_url exist on profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add role column for Admin Panel RBAC protection
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 3. Sync avatar and avatar_url values if one is present and the other is null
UPDATE public.profiles
SET avatar = COALESCE(avatar, avatar_url),
    avatar_url = COALESCE(avatar_url, avatar);

-- 4. Create index on role for fast RBAC checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 5. Force reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
