// src/app/api/payway/pago/route.js

import { NextResponse } from 'next/server';

async function getSDK() {
  const sdkModulo = await import('sdk-node-payway');
  return sdkModulo;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { pedidoId, token, bin, paymentMethodId, installments, total, compradorEmail } = body;

    if (!pedidoId || !token || !total) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const sdkModulo  = await getSDK();
    const ambiente   = process.env.PAYWAY_ENVIRONMENT || 'production';
    const publicKey  = process.env.PAYWAY_PUBLIC_KEY;
    const privateKey = process.env.PAYWAY_PRIVATE_KEY;

    const sdk = new sdkModulo.sdk(ambiente, publicKey, privateKey, 'Hoky', 'HokyEcommerce');

    // Según la doc: amount es double con dos decimales (ej: 25.50), NO en centavos
    const amount = Math.round(total * 100) / 100;

    const args = {
      site_transaction_id: pedidoId,
      token,
      user_id:            compradorEmail || 'guest',
      payment_method_id:  paymentMethodId || 1,
      bin:                bin || '',
      amount,
      currency:           'ARS',
      installments:       installments || 1,
      description:        `Pedido Hoky #${pedidoId}`,
      payment_type:       'single',
      sub_payments:       [],
    };

    console.log('Payway pago args:', JSON.stringify(args));

    const result = await new Promise((resolve, reject) => {
      sdk.payment(args, (data, err) => {
        if (err && err !== '') return reject(new Error(JSON.stringify(err)));
        resolve(data);
      });
    });

    console.log('Payway pago result:', JSON.stringify(result));

    const status = result?.status?.toLowerCase();

    if (status === 'approved') {
      return NextResponse.json({ ok: true, status: 'approved', paymentId: result.id });
    }

    if (status === 'rejected') {
      const motivo = result.status_details?.error?.reason?.description || 'Pago rechazado por el banco';
      return NextResponse.json({ ok: false, status: 'rejected', error: motivo }, { status: 402 });
    }

    return NextResponse.json({ ok: true, status: status || 'pending', paymentId: result.id });

  } catch (error) {
    console.error('Error Payway pago:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Error interno' }, { status: 500 });
  }
}