// src/lib/notificaciones.js
// Notificación por WhatsApp al admin cuando entra un pedido nuevo.
// Usa la API de CallMeBot (gratuita, no requiere cuenta de negocio).
//
// SETUP cuando quieras activarlo:
// 1. Mandá un WhatsApp a +34 644 60 49 16 con el mensaje:
//    "I allow callmebot to send me messages"
// 2. Te responden con tu API key
// 3. Agregá al .env:
//    WA_ADMIN_NUMBER=5493834644467   (sin + ni espacios)
//    WA_CALLMEBOT_APIKEY=tu_api_key
//    WA_NOTIFICACIONES_ACTIVAS=false  ← cambiá a true cuando quieras activar
//
// ALTERNATIVA (más confiable en producción): Twilio o WhatsApp Business API

const ACTIVAS = process.env.WA_NOTIFICACIONES_ACTIVAS === 'true';

export async function notificarPedidoNuevo(pedido, items = []) {
  // ── Desactivado por ahora ──────────────────────────────────
  if (!ACTIVAS) {
    console.log('[WA Notif] Desactivado — pedido:', pedido.id);
    return { ok: true, skipped: true };
  }

  const numero = process.env.WA_ADMIN_NUMBER;
  const apiKey = process.env.WA_CALLMEBOT_APIKEY;

  if (!numero || !apiKey) {
    console.warn('[WA Notif] Faltan WA_ADMIN_NUMBER o WA_CALLMEBOT_APIKEY en .env');
    return { ok: false, error: 'Credenciales no configuradas' };
  }

  try {
    const resumen = items
      .slice(0, 5) // máximo 5 items en el mensaje para no cortarlo
      .map(i => `• ${i.nombre}${i.talle ? ` (T:${i.talle})` : ''}${i.color ? ` ${i.color}` : ''} x${i.cantidad}`)
      .join('\n');

    const metodoLabel = {
      mercadopago:  '💳 Mercado Pago',
      transferencia: '🏦 Transferencia',
      efectivo:      '💵 Efectivo',
    }[pedido.metodoPago] ?? pedido.metodoPago;

    const entregaLabel = pedido.tipoEnvio === 'retiro' ? '🏪 Retiro en local' : '🚚 Envío a domicilio';

    const mensaje = [
      '🛍️ *NUEVO PEDIDO — HOKY*',
      '',
      `📋 Pedido: #${pedido.id.slice(-8).toUpperCase()}`,
      `👤 ${pedido.compradorNombre}`,
      `📱 ${pedido.compradorTelefono ?? '—'}`,
      `📧 ${pedido.compradorEmail}`,
      '',
      '🛒 *Productos:*',
      resumen,
      items.length > 5 ? `  ...y ${items.length - 5} más` : '',
      '',
      `💰 Total: $${pedido.total.toLocaleString('es-AR')}`,
      `${metodoLabel}`,
      `${entregaLabel}`,
      '',
      `🔗 Ver en admin: ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin/pedidos`,
    ].filter(l => l !== undefined).join('\n');

    const url = `https://api.callmebot.com/whatsapp.php?phone=${numero}&text=${encodeURIComponent(mensaje)}&apikey=${apiKey}`;

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok || text.toLowerCase().includes('error')) {
      console.error('[WA Notif] Error de CallMeBot:', text);
      return { ok: false, error: text };
    }

    console.log('[WA Notif] Enviado OK — pedido:', pedido.id);
    return { ok: true };

  } catch (error) {
    console.error('[WA Notif] Error al enviar notificación:', error);
    return { ok: false, error: error.message };
  }
}