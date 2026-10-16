import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Clean potential quotes, whitespace, or markdown link wrapping
export const supabaseUrl = rawUrl
  .trim()
  .replace(/^\[/, '')
  .replace(/\]\(.*\)$/, '')
  .replace(/["']/g, '');

export const supabaseAnonKey = rawKey.trim().replace(/["']/g, '');

/**
 * Validates whether Supabase credentials are configured with real values
 * and not just placeholder strings.
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 15
);

/**
 * Production-ready Supabase Client with graceful fallback.
 * If credentials are not configured (e.g. during local prototyping or initial Vercel build),
 * a dummy proxy/mock client is returned so execution never throws unhandled errors.
 */
function createSupabaseClient(): SupabaseClient {
  if (isSupabaseConfigured) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  // Safe Mock Fallback during dev or builds when env vars are absent
  // Use a fallback dummy client to prevent crashes during SSR or build time
  const fallbackUrl = 'https://placeholder.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock';
  return createClient(fallbackUrl, fallbackKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase: SupabaseClient = createSupabaseClient();
