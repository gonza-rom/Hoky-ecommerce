// src/app/api/payway/pago/route.js

import { NextResponse } from 'next/server';

async function getSDK() {
  const sdkModulo = await import('sdk-node-payway');
  return sdkModulo;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      pedidoId, token, bin, paymentMethodId, installments, total,
      compradorEmail, compradorNombre, tipoEnvio, direccion, items,
      deviceFingerprint,
    } = body;

    if (!pedidoId || !token || !total) {
      return NextResponse.json({ ok: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const sdkModulo  = await getSDK();
    const ambiente   = process.env.PAYWAY_ENVIRONMENT || 'production';
    const publicKey  = process.env.PAYWAY_PUBLIC_KEY;
    const privateKey = process.env.PAYWAY_PRIVATE_KEY;

    const sdk = new sdkModulo.sdk(ambiente, publicKey, privateKey, 'Hoky', 'HokyEcommerce');

    const amount = Math.round(total * 100) / 100;

    const [firstName, ...lastNameParts] = (compradorNombre || 'Cliente Hoky').split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const ciudad      = direccion?.ciudad      || 'San Fernando del Valle de Catamarca';
    const codigoPostal = direccion?.codigoPostal || '4700';
    const calle       = direccion?.calle        || 'Sin dirección';

    // ship_to siempre requerido por Cybersource
    const shipTo = {
      city:         ciudad,
      country:      'AR',
      email:        compradorEmail || 'cliente@hoky.com',
      first_name:   firstName,
      last_name:    lastName,
      phone_number: '3834000000',
      postal_code:  codigoPostal,
      state:        'K',
      street1:      tipoEnvio === 'retiro' ? 'Esquiú 620' : calle,
      street2:      tipoEnvio === 'retiro' ? 'Retiro en local' : '',
    };

    const fraudDetection = {
      send_to_cs:    true,
      channel:       'web',
      device_unique_id: deviceFingerprint || pedidoId, // fingerprint del dispositivo
      bill_to: {
        city:         ciudad,
        country:      'AR',
        customer_id:  compradorEmail || 'guest',
        email:        compradorEmail || 'cliente@hoky.com',
        first_name:   firstName,
        last_name:    lastName,
        phone_number: '3834000000',
        postal_code:  codigoPostal,
        state:        'K',
        street1:      calle,
        street2:      '',
      },
      purchase_totals: {
        currency: 'ARS',
        amount:   Math.round(total * 100),
      },
      customer_in_site: {
        days_in_site:        0,
        is_guest:            true,
        num_of_transactions: 1,
      },
      retail_transaction_data: {
        ship_to:          shipTo,
        dispatch_method:  tipoEnvio === 'retiro' ? 'pickUp' : 'homeDelivery',
        days_to_delivery: tipoEnvio === 'retiro' ? 0 : 7,
        items: (items || [{ nombre: 'Productos Hoky', cantidad: 1, precio: total }]).map((item, i) => ({
          id:          String(i + 1),
          value:       Math.round((item.precio || total) * 100),
          description: item.nombre || 'Producto',
          quantity:    item.cantidad || 1,
        })),
      },
    };

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
      fraud_detection:    fraudDetection,
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
      const validationErrors = result.fraud_detection?.status?.details?.validation_errors;
      const motivo = validationErrors?.length
        ? validationErrors.map(e => e.param).join(', ')
        : result.status_details?.error?.reason?.description || 'Pago rechazado';
      return NextResponse.json({ ok: false, status: 'rejected', error: motivo }, { status: 402 });
    }

    return NextResponse.json({ ok: true, status: status || 'pending', paymentId: result.id });

  } catch (error) {
    console.error('Error Payway pago:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Error interno' }, { status: 500 });
  }
}