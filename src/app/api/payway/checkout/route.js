// src/app/api/payway/checkout/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pedidoId, total, items } = body;

    if (!pedidoId || !total) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const ambiente   = process.env.PAYWAY_ENVIRONMENT || 'sandbox';
    const publicKey  = process.env.PAYWAY_PUBLIC_KEY;
    const privateKey = process.env.PAYWAY_PRIVATE_KEY;
    const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL || 'https://hoky-ecommerce.vercel.app';

    const endpoint = ambiente === 'production'
      ? 'https://ventasonline.payway.com.ar/api/v1/checkout-payment-button/link'
      : 'https://developers.decidir.com/api/v1/checkout-payment-button/link';

    const descripcion = items?.map(i => `${i.nombre} x${i.cantidad}`).join(', ') || 'Compra Hoky';

    const payload = {
      origin_platform:     'SDK-Node',
      currency:            'ARS',
      total_price:         total,
      site:                process.env.PAYWAY_SITE_ID || '93021573',
      template_id:         1,
      installments:        [1, 3, 6],
      plan_gobierno:       false,
      public_apikey:       publicKey,
      auth_3ds:            false,
      payment_description: descripcion,
      success_url:         `${baseUrl}/checkout/exito?pedido=${pedidoId}&metodo=payway`,
      cancel_url:          `${baseUrl}/checkout?cancelado=true`,
      notifications_url:   `${baseUrl}/api/payway/webhook`,
    };

    console.log('Payway endpoint:', endpoint);
    console.log('Payway payload:', JSON.stringify(payload, null, 2));

    const res = await fetch(endpoint, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        privateKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('Payway status:', res.status);
    console.log('Payway raw response:', text.substring(0, 500));

    let result;
    try { result = JSON.parse(text); }
    catch {
      return NextResponse.json(
        { ok: false, error: 'Payway devolvió respuesta inesperada', raw: text.substring(0, 300) },
        { status: 500 }
      );
    }

    if (!res.ok || result?.error_type) {
      const errores = result.validation_errors?.map(e => `${e.param}: ${e.code}`).join(', ')
        || result.description || result.error || result.message || 'Error desconocido';
      return NextResponse.json({ ok: false, error: `Payway: ${errores}`, raw: result }, { status: 400 });
    }

    const paymentId = result?.id ?? result?.payment_id ?? result?.data?.id ?? result?.hash;

    if (!paymentId) {
      return NextResponse.json({ ok: false, error: 'Sin paymentId en respuesta', raw: result }, { status: 500 });
    }

    // URL del formulario hosted según ambiente
    const checkoutUrl = ambiente === 'production'
      ? `https://ventasonline.payway.com.ar/web/checkout/${paymentId}`
      : `https://developers.decidir.com/web/checkout/${paymentId}`;

    return NextResponse.json({ ok: true, checkoutUrl, paymentId });

  } catch (error) {
    console.error('Error Payway:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}