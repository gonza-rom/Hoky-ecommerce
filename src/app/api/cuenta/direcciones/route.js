// src/app/api/cuenta/direcciones/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma }       from '@/lib/prisma';

// ── GET — listar direcciones ──────────────────────────────
export async function GET() {
  try {
    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
    if (!cliente)  return NextResponse.json({ ok: true, data: [] });

    const direcciones = await prisma.direccion.findMany({
      where:   { clienteId: cliente.id },
      orderBy: [{ esPrincipal: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ ok: true, data: direcciones });
  } catch (error) {
    console.error('[GET /api/cuenta/direcciones]', error);
    return NextResponse.json({ ok: false, error: 'Error al obtener direcciones' }, { status: 500 });
  }
}

// ── POST — crear dirección ────────────────────────────────
export async function POST(req) {
  try {
    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
    if (!cliente)  return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });

    const { alias, calle, numero, piso, departamento, ciudad, provincia, codigoPostal, esPrincipal } = await req.json();

    if (!calle?.trim() || !ciudad?.trim() || !provincia?.trim() || !codigoPostal?.trim()) {
      return NextResponse.json({ ok: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Si es principal, quitar el flag de las otras
    if (esPrincipal) {
      await prisma.direccion.updateMany({
        where: { clienteId: cliente.id },
        data:  { esPrincipal: false },
      });
    }

    const direccion = await prisma.direccion.create({
      data: {
        clienteId: cliente.id,
        alias:        alias?.trim()        || null,
        calle:        calle.trim(),
        numero:       numero?.trim()       || null,
        piso:         piso?.trim()         || null,
        departamento: departamento?.trim() || null,
        ciudad:       ciudad.trim(),
        provincia:    provincia.trim(),
        codigoPostal: codigoPostal.trim(),
        esPrincipal:  esPrincipal ?? false,
      },
    });

    return NextResponse.json({ ok: true, data: direccion }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cuenta/direcciones]', error);
    return NextResponse.json({ ok: false, error: 'Error al crear dirección' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';