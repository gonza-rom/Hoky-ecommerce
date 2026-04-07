// src/app/api/admin/pedidos/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

const ESTADOS_VALIDOS = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'REEMBOLSADO'];

export async function PATCH(req, { params }) {
  try {
    const { id }   = await params;
    const { estado, notasInternas, tracking } = await req.json();

    const pedido = await prisma.pedido.findFirst({ where: { id } });
    if (!pedido) return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });

    if (estado && !ESTADOS_VALIDOS.includes(estado))
      return NextResponse.json({ ok: false, error: 'Estado inválido' }, { status: 400 });

    const data = {};
    if (estado) {
      data.estado = estado;
      if (estado === 'PAGADO')    data.pagadoAt    = new Date();
      if (estado === 'EN_CAMINO') data.enviadoAt   = new Date();
      if (estado === 'ENTREGADO') data.entregadoAt = new Date();
    }
    if (notasInternas !== undefined) data.notasInternas = notasInternas;
    if (tracking       !== undefined) data.tracking      = tracking;

    const actualizado = await prisma.pedido.update({ where: { id }, data });

    return NextResponse.json({ ok: true, data: actualizado });
  } catch (error) {
    console.error('[PATCH /api/admin/pedidos/:id]', error);
    return NextResponse.json({ ok: false, error: 'Error al actualizar pedido' }, { status: 500 });
  }
}

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const pedido = await prisma.pedido.findFirst({
      where:   { id },
      include: {
        items:    true,
        cliente:  { select: { nombre: true, email: true, telefono: true } },
        direccion: true,
      },
    });
    if (!pedido) return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
    return NextResponse.json({ ok: true, data: pedido });
  } catch (error) {
    console.error('[GET /api/admin/pedidos/:id]', error);
    return NextResponse.json({ ok: false, error: 'Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';