// src/app/api/payway/webhook/route.js
// Recibe notificaciones de Payway cuando un pago se completa/rechaza

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Payway webhook recibido:', JSON.stringify(body));

    // Payway envía el estado del pago en el webhook
    // Los campos varían según el evento, los más importantes:
    const {
      id,                  // payment_id de Payway
      site_transaction_id, // tu pedidoId
      status,              // approved / rejected / cancelled
      amount,
    } = body;

    if (!site_transaction_id) {
      return NextResponse.json({ ok: true }); // ignorar si no trae ID
    }

    // Mapear estado de Payway a tu modelo
    const estadoMap = {
      approved:  'PAGADO',
      rejected:  'CANCELADO',
      cancelled: 'CANCELADO',
      pending:   'PENDIENTE',
    };

    const nuevoEstado = estadoMap[status?.toLowerCase()] ?? 'PENDIENTE';

    // Actualizar el pedido en la base de datos
    await prisma.pedido.update({
      where: { id: site_transaction_id },
      data: {
        estado:          nuevoEstado,
        paywayPaymentId: String(id ?? ''),
        updatedAt:       new Date(),
      },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Error webhook Payway:', error);
    // Siempre responder 200 a Payway aunque falle internamente
    return NextResponse.json({ ok: true });
  }
}

// Payway a veces hace GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Hoky Payway Webhook' });
}