// src/app/auth/callback/route.js
// Maneja:
//  1. Google OAuth (code en query params)
//  2. Confirmación de email (code en query params)
// Después de intercambiar el código → sincroniza el Cliente en la BD.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const redirect = searchParams.get('redirect') ?? '/cuenta';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sincronizar con la tabla Cliente — llamamos internamente a nuestra API
      try {
        await fetch(`${origin}/api/auth/sync`, {
          method:  'POST',
          headers: { 'Cookie': request.headers.get('cookie') ?? '' },
        });
      } catch (e) {
        console.error('[callback] Error al sincronizar cliente:', e);
        // No bloqueamos el redirect aunque falle el sync
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`);
}