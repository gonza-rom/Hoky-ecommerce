// src/app/api/auth/sync/route.js
// Crea o actualiza el Cliente en la BD cuando el usuario inicia sesión.
// Se llama desde el callback de OAuth y desde el login con email.

import { NextResponse }  from 'next/server';
import { createClient }  from '@/lib/supabase/server';
import { prisma }        from '@/lib/prisma';

export async function POST() {
  try {
    const supabase          = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    // Upsert: crea el cliente si no existe, actualiza si ya está
    const cliente = await prisma.cliente.upsert({
      where:  { supabaseId: user.id },
      update: {
        // Actualizar email y nombre si cambiaron en Supabase
        email:  user.email,
        nombre: user.user_metadata?.nombre
                  ?? user.user_metadata?.full_name   // Google OAuth usa full_name
                  ?? user.email.split('@')[0],
        updatedAt: new Date(),
      },
      create: {
        id:         `cli_${user.id.replace(/-/g, '').slice(0, 20)}`,
        supabaseId: user.id,
        email:      user.email,
        nombre:     user.user_metadata?.nombre
                      ?? user.user_metadata?.full_name
                      ?? user.email.split('@')[0],
        updatedAt:  new Date(),
      },
    });

    return NextResponse.json({ ok: true, clienteId: cliente.id });
  } catch (error) {
    // Si el email ya existe con otro supabaseId (raro pero posible)
    if (error.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Email ya registrado' }, { status: 409 });
    }
    console.error('[POST /api/auth/sync]', error);
    return NextResponse.json({ ok: false, error: 'Error al sincronizar' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';