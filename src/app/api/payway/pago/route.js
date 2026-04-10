// src/app/api/payway/pago/route.js
// Llama directo a la API de Payway sin SDK (el SDK sobreescribe los items de Cybersource)

import { NextResponse } from 'next/server';

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

    const privateKey  = process.env.PAYWAY_PRIVATE_KEY;
    const amount = Math.round(total * 100); // en centavos: $25.50 → 2550

    const [firstName, ...lastNameParts] = (compradorNombre || 'Cliente Hoky').split(' ');
    const lastName     = lastNameParts.join(' ') || firstName;
    const ciudad       = direccion?.ciudad       || 'San Fernando del Valle de Catamarca';
    const codigoPostal = direccion?.codigoPostal || '4700';
    const calle        = tipoEnvio === 'retiro'  ? 'Esquiú 620' : (direccion?.calle || 'Sin dirección');

    const shipTo = {
      city:         ciudad,
      country:      'AR',
      email:        compradorEmail || 'cliente@hoky.com',
      first_name:   firstName,
      last_name:    lastName,
      phone_number: '3834000000',
      postal_code:  codigoPostal,
      state:        'K',
      street1:      calle,
      street2:      '',
    };

    const csItems = (items || [{ nombre: 'Indumentaria Hoky', cantidad: 1, precio: total }]).map((item, i) => ({
      code:         `HOKY${String(i + 1).padStart(3, '0')}`,
      name:         (item.nombre || 'Indumentaria').slice(0, 255),
      description:  (item.nombre || 'Indumentaria').slice(0, 255),
      sku:          `SKU${String(i + 1).padStart(3, '0')}`,
      total_amount: Math.round((item.precio || total) * (item.cantidad || 1) * 100),
      unit_price:   Math.round((item.precio || total) * 100),
      quantity:     item.cantidad || 1,
    }));

    const payload = {
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
      fraud_detection: {
        send_to_cs:       false,
        channel:          'web',
        device_unique_id: deviceFingerprint || pedidoId,
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
          days_to_delivery: tipoEnvio === 'retiro' ? '0' : '7',
          items:            csItems,
        },
      },
    };

    console.log('Payway payload:', JSON.stringify(payload, null, 2));

    const res = await fetch('https://ventasonline.payway.com.ar/api/v2/payments', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        privateKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('Payway response:', JSON.stringify(result, null, 2));

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