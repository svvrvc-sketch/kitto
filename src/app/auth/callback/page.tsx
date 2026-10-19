'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogoIcon } from '@/components/Logo';

function CallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState('Tizimga kirilmoqda...');

  useEffect(() => {
    let isSubscribed = true;

    const checkSession = async () => {
      try {
        // 1. Supabase client in browser automatically reads PKCE ?code= from URL
        // and exchanges it using localStorage's code_verifier
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[OAuth Callback Error]:', error);
          setStatus('Kirishda xatolik yuz berdi');
          setTimeout(() => router.replace('/'), 1500);
          return;
        }

        if (session?.user && isSubscribed) {
          setStatus('Muvaffaqiyatli kirildi!');
          fetch('/api/telegram-login-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Google foydalanuvchisi',
              contact: session.user.email || 'Google hisobi',
              email: session.user.email,
              provider: 'Google orqali',
              id: session.user.id,
            }),
          }).catch(() => {});
          router.replace('/');
          return;
        }

        // 2. Listen for SIGNED_IN event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && isSubscribed) {
            setStatus('Muvaffaqiyatli kirildi!');
            fetch('/api/telegram-login-notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Google foydalanuvchisi',
                contact: session.user.email || 'Google hisobi',
                email: session.user.email,
                provider: 'Google orqali',
                id: session.user.id,
              }),
            }).catch(() => {});
            router.replace('/');
          }
        });

        // 3. Fallback timeout to prevent infinite loading
        const timer = setTimeout(() => {
          if (isSubscribed) {
            router.replace('/');
          }
        }, 2500);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        console.error('[OAuth Unexpected Error]:', err);
        if (isSubscribed) {
          router.replace('/');
        }
      }
    };

    checkSession();

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  return (
    <div className="text-center space-y-4 p-8 max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-center">
        <div className="relative animate-pulse">
          <LogoIcon size={52} />
        </div>
      </div>
      <div>
        <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
          {status}
        </h2>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
          Iltimos kuting, profilingiz faollashtirilmoqda...
        </p>
      </div>
      <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div className="bg-[#141413] dark:bg-stone-200 h-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100">
      <Suspense
        fallback={
          <div className="p-4 text-xs text-stone-400 font-medium">
            Yuklanmoqda...
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
