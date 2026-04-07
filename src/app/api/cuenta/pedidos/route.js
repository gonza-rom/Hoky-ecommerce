// src/app/api/cuenta/pedidos/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma }       from '@/lib/prisma';

export async function GET() {
  try {
    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
    if (!cliente)  return NextResponse.json({ ok: true, data: [] });

    const pedidos = await prisma.pedido.findMany({
      where:   { clienteId: cliente.id },
      include: { items: { select: { nombre: true, cantidad: true, precio: true, talle: true, color: true, imagen: true } } },
      orderBy: { createdAt: 'desc' },
      take:    20,
    });

    return NextResponse.json({ ok: true, data: pedidos });
  } catch (error) {
    console.error('[GET /api/cuenta/pedidos]', error);
    return NextResponse.json({ ok: false, error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';