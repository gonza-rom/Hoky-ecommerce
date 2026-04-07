// src/app/auth/callback/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma }       from '@/lib/prisma';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const redirect = searchParams.get('redirect') ?? '/cuenta';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sincronizar Cliente directamente (sin fetch interno)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await prisma.cliente.upsert({
            where:  { supabaseId: user.id },
            update: {
              email:  user.email,
              nombre: user.user_metadata?.nombre
                        ?? user.user_metadata?.full_name
                        ?? user.email.split('@')[0],
            },
            create: {
              supabaseId: user.id,
              email:      user.email,
              nombre:     user.user_metadata?.nombre
                            ?? user.user_metadata?.full_name
                            ?? user.email.split('@')[0],
            },
          });
        }
      } catch (e) {
        console.error('[callback] Error al sincronizar cliente:', e);
        // No bloqueamos el redirect aunque falle el sync
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`);
}