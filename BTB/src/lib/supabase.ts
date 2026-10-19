import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Clean potential quotes, whitespace, or markdown link wrapping
export const supabaseUrl = rawUrl
  .trim()
  .replace(/^\[/, '')
  .replace(/\]\(.*\)$/, '')
  .replace(/["']/g, '');

export const supabaseAnonKey = rawKey.trim().replace(/["']/g, '');
export const supabaseServiceRoleKey = rawServiceKey.trim().replace(/["']/g, '');

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

// Graceful environment warning if keys are missing
if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Kitto Supabase] DIQQAT: NEXT_PUBLIC_SUPABASE_URL yoki NEXT_PUBLIC_SUPABASE_ANON_KEY toʻliq sozlanmagan. Ilova mahalliy offline rejimida ishlamoqda. Iltimos, .env.local faylini tekshiring.'
  );
} else if (!isSupabaseConfigured && typeof window === 'undefined') {
  console.warn(
    '[Kitto Supabase Server] Ogohlantirish: Serverda Supabase kalitlari topilmadi. Mock mijoz ishga tushiriladi.'
  );
}

/**
 * Production-ready Supabase Client with graceful fallback.
 * Uses PKCE auth flow for secure browser OAuth (Google etc.) and automatic session persistence.
 */
function createSupabaseClient(): SupabaseClient {
  if (isSupabaseConfigured) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  // Safe Mock Fallback during dev or builds when env vars are absent
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

/**
 * Server-side Admin Supabase Client (Service Role)
 * Used in server routes or middleware for RBAC checks without RLS restrictions.
 */
export function getServiceSupabase(): SupabaseClient | null {
  const serviceKey = supabaseServiceRoleKey || supabaseAnonKey;
  if (!isSupabaseConfigured || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
