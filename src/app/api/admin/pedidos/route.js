// src/app/api/admin/pedidos/route.js
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1'));
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'));
    const skip     = (page - 1) * pageSize;

    const busqueda = searchParams.get('q')      ?? '';
    const estado   = searchParams.get('estado') ?? '';

    // ── WHERE ──────────────────────────────────────────────────────────────
    const where = {};

    if (estado) where.estado = estado;

    if (busqueda.trim()) {
      where.OR = [
        { compradorNombre: { contains: busqueda, mode: 'insensitive' } },
        { compradorEmail:  { contains: busqueda, mode: 'insensitive' } },
        // Búsqueda por los últimos 8 chars del id (como se muestra en la UI)
        { id: { endsWith: busqueda.toLowerCase() } },
      ];
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          items: {
            select: {
              nombre:   true,
              cantidad: true,
              precio:   true,
              talle:    true,
              color:    true,
              imagen:   true,
            },
          },
          cliente: {
            select: { nombre: true, email: true, telefono: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.pedido.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      ok:   true,
      data: pedidos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/pedidos]', error);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';