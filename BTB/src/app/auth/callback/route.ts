import { NextResponse } from 'next/server';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code && supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session) {
        const response = NextResponse.redirect(`${origin}${next}`);
        const user = data.session.user;
        
        // Set cookies for client & middleware recognition
        response.cookies.set('kitto_user_id', user.id, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
        });
        
        return response;
      }
    } catch (e) {
      console.error('Error exchanging OAuth code for session:', e);
    }
  }

  // Fallback to origin
  return NextResponse.redirect(`${origin}${next}`);
}
