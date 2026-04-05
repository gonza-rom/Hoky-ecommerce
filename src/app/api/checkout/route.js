// src/app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ── Crear preferencia de Mercado Pago ─────────────────────
async function crearPreferenciaMp(pedido, items, total, compradorEmail) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const body = {
      items: items.map(item => ({
        id:          item.productoId ?? 'producto',
        title:       item.nombre,
        quantity:    item.cantidad,
        unit_price:  item.precio,
        currency_id: 'ARS',
      })),
      payer: {
        email: compradorEmail,
      },
      back_urls: {
        success: `${APP_URL}/checkout/exito?pedido=${pedido.id}&status=approved`,
        failure: `${APP_URL}/checkout/exito?pedido=${pedido.id}&status=rejected`,
        pending: `${APP_URL}/checkout/exito?pedido=${pedido.id}&status=pending`,
      },
      auto_return:    'approved',
      external_reference: pedido.id,
      statement_descriptor: 'HOKY INDUMENTARIA',
    };

    const res  = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[MP] Error al crear preferencia:', data);
      return null;
    }

    // Actualizar pedido con el ID de MP
    await prisma.pedido.update({
      where: { id: pedido.id },
      data:  { mpPaymentId: data.id },
    });

    return data.init_point; // URL de pago
  } catch (err) {
    console.error('[MP] Error:', err);
    return null;
  }
}

// ── POST /api/checkout ─────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      items,
      subtotal,
      costoEnvio,
      total,
      metodoPago,
      tipoEnvio,
      compradorNombre,
      compradorEmail,
      compradorTelefono,
      notas,
      direccion,
    } = body;

    // Validaciones básicas
    if (!items?.length)       return NextResponse.json({ ok: false, error: 'El carrito está vacío' }, { status: 400 });
    if (!compradorNombre)     return NextResponse.json({ ok: false, error: 'Nombre requerido' }, { status: 400 });
    if (!compradorEmail)      return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 });
    if (!metodoPago)          return NextResponse.json({ ok: false, error: 'Método de pago requerido' }, { status: 400 });
    if (tipoEnvio === 'envio' && !direccion) return NextResponse.json({ ok: false, error: 'Dirección requerida para envío' }, { status: 400 });

    // ── Verificar stock de cada ítem ────────────────────────
    for (const item of items) {
      if (item.varianteId) {
        const variante = await prisma.productoVariante.findFirst({
          where: { id: item.varianteId, activo: true },
        });
        if (!variante || variante.stock < item.cantidad) {
          return NextResponse.json({ ok: false, error: `Sin stock suficiente para: ${item.nombre}` }, { status: 409 });
        }
      } else if (item.productoId) {
        const producto = await prisma.producto.findFirst({
          where: { id: item.productoId, activo: true },
        });
        if (!producto || producto.stock < item.cantidad) {
          return NextResponse.json({ ok: false, error: `Sin stock suficiente para: ${item.nombre}` }, { status: 409 });
        }
      }
    }

    // ── Obtener usuario autenticado (opcional) ──────────────
    let clienteId = null;
    try {
      const supabase           = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
        if (cliente) clienteId = cliente.id;
      }
    } catch {}

    // ── Crear pedido en transacción ─────────────────────────
    const pedido = await prisma.$transaction(async (tx) => {

      // Crear dirección si viene
      let direccionId = null;
      if (tipoEnvio === 'envio' && direccion && clienteId) {
        const dir = await tx.direccion.create({
          data: {
            clienteId,
            calle:        direccion.calle,
            numero:       direccion.numero ?? null,
            piso:         direccion.piso ?? null,
            departamento: direccion.departamento ?? null,
            ciudad:       direccion.ciudad,
            provincia:    direccion.provincia,
            codigoPostal: direccion.codigoPostal,
          },
        });
        direccionId = dir.id;
      }

      // Crear pedido
      const p = await tx.pedido.create({
        data: {
          clienteId,
          direccionId,
          estado:     'PENDIENTE',
          subtotal,
          costoEnvio,
          total,
          metodoPago,
          tipoEnvio,
          compradorNombre,
          compradorEmail,
          compradorTelefono,
          notas,
          items: {
            create: items.map(item => ({
              productoId: item.productoId ?? null,
              varianteId: item.varianteId ?? null,
              nombre:     item.nombre,
              precio:     item.precio,
              cantidad:   item.cantidad,
              subtotal:   item.subtotal,
              talle:      item.talle ?? null,
              color:      item.color ?? null,
              imagen:     item.imagen ?? null,
            })),
          },
        },
      });

      // Descontar stock
      for (const item of items) {
        if (item.varianteId) {
          await tx.productoVariante.update({
            where: { id: item.varianteId },
            data:  { stock: { decrement: item.cantidad } },
          });
        } else if (item.productoId) {
          await tx.producto.update({
            where: { id: item.productoId },
            data:  { stock: { decrement: item.cantidad } },
          });
        }
      }

      return p;
    });

    // ── Mercado Pago ────────────────────────────────────────
    let mpInitPoint = null;
    if (metodoPago === 'mercadopago') {
      mpInitPoint = await crearPreferenciaMp(pedido, items, total, compradorEmail);
      if (!mpInitPoint) {
        // Si falla MP, igual devolvemos el pedido creado
        return NextResponse.json({
          ok:      true,
          pedidoId: pedido.id,
          warning:  'No se pudo crear el link de Mercado Pago. Coordinaremos el pago por WhatsApp.',
        });
      }
    }

    return NextResponse.json({ ok: true, pedidoId: pedido.id, mpInitPoint });

  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json({ ok: false, error: 'Error al procesar el pedido' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';