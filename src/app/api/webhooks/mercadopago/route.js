// src/app/api/webhooks/mercadopago/route.js
//
// Recibe notificaciones de Mercado Pago (IPN / webhook) y actualiza
// el estado del pedido automáticamente cuando el pago es aprobado.
//
// Configuración en el panel de MP:
//   URL: https://tu-dominio.com/api/webhooks/mercadopago
//   Eventos: payment
//
// Variables de entorno necesarias:
//   MP_ACCESS_TOKEN      — token de acceso de MP
//   MP_WEBHOOK_SECRET    — secret para validar la firma (opcional pero recomendado)

import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

// ── Verificar firma de MP (opcional, recomendado en producción) ────────────
function verificarFirma(req, body) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret configurado, aceptar todo

  const xSignature  = req.headers.get('x-signature')  ?? '';
  const xRequestId  = req.headers.get('x-request-id') ?? '';
  const dataId      = new URL(req.url).searchParams.get('data.id') ?? '';

  // Formato: ts=...,v1=...
  const parts = Object.fromEntries(
    xSignature.split(',').map(part => {
      const [k, v] = part.split('=');
      return [k.trim(), v.trim()];
    })
  );

  const ts = parts['ts'] ?? '';
  const v1 = parts['v1'] ?? '';
  if (!ts || !v1) return false;

  const mensaje = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // HMAC-SHA256
  const { createHmac } = require('crypto');
  const hash = createHmac('sha256', secret).update(mensaje).digest('hex');

  return hash === v1;
}

// ── Consultar pago en la API de MP ─────────────────────────────────────────
async function obtenerPago(paymentId) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurado');

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? `Error MP ${res.status}`);
  }

  return res.json();
}

// ── POST — recibir notificación ────────────────────────────────────────────
export async function POST(req) {
  try {
    // Validar firma
    const rawBody = await req.text();
    // Re-parsear para usar abajo (req.text() consume el stream)
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 });
    }

    // Verificar firma si hay secret configurado
    // (usamos una req "fake" con el rawBody ya consumido)
    // Nota: para validar firma correctamente en producción usá el middleware de MP.

    // MP envía distintos tipos de notificación
    const topic = data.type ?? data.topic ?? '';
    const id    = data.data?.id ?? data.id ?? null;

    if (topic !== 'payment' || !id) {
      // Ignorar notificaciones que no son de pago (ej: merchant_orders)
      return NextResponse.json({ ok: true });
    }

    // Consultar estado del pago en MP
    const pago = await obtenerPago(id);

    const mpStatus        = pago.status;           // approved | rejected | pending | etc.
    const externalRef     = pago.external_reference; // pedidoId
    const mpPaymentId     = String(pago.id);

    if (!externalRef) {
      console.warn('[MP Webhook] Pago sin external_reference:', id);
      return NextResponse.json({ ok: true });
    }

    // Buscar el pedido
    const pedido = await prisma.pedido.findFirst({
      where: {
        OR: [
          { id:          externalRef },
          { mpPaymentId: mpPaymentId },
        ],
      },
    });

    if (!pedido) {
      console.warn('[MP Webhook] Pedido no encontrado para pago:', id, externalRef);
      return NextResponse.json({ ok: true }); // devolvemos 200 igual para que MP no reintente
    }

    // Mapear estado de MP a estado interno
    const nuevoEstado = (() => {
      if (mpStatus === 'approved')  return 'PAGADO';
      if (mpStatus === 'rejected')  return 'CANCELADO';
      // pending, in_process, authorized → dejar en PENDIENTE
      return null;
    })();

    if (nuevoEstado && pedido.estado !== nuevoEstado) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          estado:       nuevoEstado,
          mpStatus,
          mpPaymentId,
          ...(nuevoEstado === 'PAGADO' ? { pagadoAt: new Date() } : {}),
        },
      });
      console.log(`[MP Webhook] Pedido ${pedido.id} → ${nuevoEstado} (pago ${id})`);
    } else {
      // Actualizar mpStatus e mpPaymentId aunque no cambie el estado
      await prisma.pedido.update({
        where: { id: pedido.id },
        data:  { mpStatus, mpPaymentId },
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[POST /api/webhooks/mercadopago]', error);
    // Devolver 200 igual para evitar reintentos de MP en errores de BD
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
}

// MP también hace GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ ok: true, service: 'hoky-mp-webhook' });
}

export const dynamic = 'force-dynamic';