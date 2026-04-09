// src/app/api/payway/pago/route.js
// Tokeniza con SDK Node (tokenización interna) y procesa el pago

import { NextResponse } from 'next/server';

async function getSDK() {
  const sdkModulo = await import('sdk-node-payway');
  return sdkModulo;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      pedidoId, compradorEmail, total,
      installments, paymentMethodId, bin,
      cardData, // { card_number, expiration_date, card_holder, security_code, account_number, email_holder }
    } = body;

    if (!pedidoId || !total || !cardData) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const sdkModulo  = await getSDK();
    const ambiente   = process.env.PAYWAY_ENVIRONMENT || 'production';
    const publicKey  = process.env.PAYWAY_PUBLIC_KEY;
    const privateKey = process.env.PAYWAY_PRIVATE_KEY;
    const siteId     = process.env.PAYWAY_SITE_ID || '93021573';

    const sdk = new sdkModulo.sdk(ambiente, publicKey, privateKey, 'Hoky', 'HokyEcommerce');

    // Paso 1: Tokenización interna con los datos de tarjeta
    const tokenArgs = {
      card_data: {
        card_number:     cardData.card_number,
        expiration_date: cardData.expiration_date, // MMAA ej: "1230"
        card_holder:     cardData.card_holder,
        security_code:   cardData.security_code,
        account_number:  cardData.account_number || cardData.card_number,
        email_holder:    cardData.email_holder || compradorEmail || 'comprador@hoky.com',
      },
      establishment_number: siteId,
    };

    console.log('Payway tokenización interna...');

    const tokenResult = await new Promise((resolve, reject) => {
      sdk.internaltokens(tokenArgs, (data, err) => {
        if (err && err !== '') return reject(new Error(JSON.stringify(err)));
        resolve(data);
      });
    });

    console.log('Token result:', JSON.stringify(tokenResult));

    const token = tokenResult?.id || tokenResult?.token;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo tokenizar la tarjeta', raw: tokenResult },
        { status: 400 }
      );
    }

    // Paso 2: Ejecutar el pago con el token
    const amountCentavos = Math.round(total * 100);

    const pagoArgs = {
      site_transaction_id: pedidoId,
      token,
      user_id:            compradorEmail || 'guest',
      payment_method_id:  paymentMethodId || 1,
      bin:                bin || cardData.card_number.slice(0, 6),
      amount:             amountCentavos,
      currency:           'ARS',
      installments:       installments || 1,
      description:        `Pedido Hoky #${pedidoId}`,
      payment_type:       'single',
      sub_payments:       [],
    };

    console.log('Payway pago args:', JSON.stringify(pagoArgs));

    const pagoResult = await new Promise((resolve, reject) => {
      sdk.payment(pagoArgs, (data, err) => {
        if (err && err !== '') return reject(new Error(JSON.stringify(err)));
        resolve(data);
      });
    });

    console.log('Payway pago result:', JSON.stringify(pagoResult));

    const status = pagoResult?.status?.toLowerCase();

    if (status === 'approved') {
      return NextResponse.json({ ok: true, status: 'approved', paymentId: pagoResult.id });
    }

    if (status === 'rejected') {
      const motivo = pagoResult.status_details?.error?.reason?.description || 'Pago rechazado por el banco';
      return NextResponse.json({ ok: false, status: 'rejected', error: motivo }, { status: 402 });
    }

    return NextResponse.json({ ok: true, status: status || 'pending', paymentId: pagoResult.id });

  } catch (error) {
    console.error('Error Payway pago:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Error interno' }, { status: 500 });
  }
}