    // src/app/envios/page.js
// Lee las políticas desde la config de la tienda guardada en la BD.
// Si no hay texto cargado, muestra un contenido por defecto.

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ZONAS_ENVIO, ENVIO_GRATIS_DESDE } from '@/lib/envio';

export const metadata = {
  title:       'Envíos y cambios — Hoky Indumentaria',
  description: 'Información sobre envíos, tiempos de entrega, cambios y devoluciones en Hoky Indumentaria.',
};

export const revalidate = 3600; // revalidar cada hora

async function getConfig() {
  try {
    return await prisma.configTienda.findFirst({ where: { id: 'hoky-config' } });
  } catch {
    return null;
  }
}

export default async function EnviosPage() {
  const config = await getConfig();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ background: '#111', color: '#fff', padding: '56px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 10px' }}>
            Información
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(40px, 7vw, 64px)',
            lineHeight: 0.95, letterSpacing: '0.02em', margin: '0 0 16px',
          }}>
            ENVÍOS Y CAMBIOS
          </h1>
          <p style={{ fontSize: 14, opacity: 0.5, lineHeight: 1.7, margin: 0 }}>
            Todo lo que necesitás saber sobre cómo llega tu pedido y qué hacemos si algo no está bien.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px' }}>

        {/* Tabla de zonas y precios */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={h2Style}>Zonas y costos de envío</h2>

          <div style={{ border: '1px solid #e8e5e0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            {/* Header tabla */}
            <div style={{ background: '#111', color: '#fff', display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: 8, padding: '12px 20px' }}>
              {['Zona / Provincias', 'Costo', 'Días', 'Envío gratis'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>

            {ZONAS_ENVIO.map((zona, i) => (
              <div key={zona.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: 8,
                padding: '14px 20px',
                borderTop: i > 0 ? '1px solid #f0ede8' : 'none',
                background: i % 2 === 0 ? '#fff' : '#fafaf8',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 3px' }}>{zona.nombre}</p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                    {zona.provincias.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111', alignSelf: 'center' }}>
                  ${zona.precio.toLocaleString('es-AR')}
                </span>
                <span style={{ fontSize: 13, color: '#555', alignSelf: 'center' }}>
                  {zona.diasMin}–{zona.diasMax} días hábiles
                </span>
                <span style={{ fontSize: 12, alignSelf: 'center' }}>
                  {zona.envioGratis
                    ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Sí</span>
                    : <span style={{ color: '#aaa' }}>—</span>
                  }
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px' }}>
            <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>
              🎉 <strong>Envío gratis en Local y NOA</strong> para compras desde{' '}
              <strong>${ENVIO_GRATIS_DESDE.toLocaleString('es-AR')}</strong>.
              Los tiempos son estimados y pueden variar según el servicio de correo.
            </p>
          </div>
        </section>

        {/* Política de envíos */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={h2Style}>Política de envíos</h2>
          {config?.politicaEnvio ? (
            <div style={proseStyle}>
              {config.politicaEnvio.split('\n').map((p, i) => (
                <p key={i} style={{ margin: '0 0 12px' }}>{p}</p>
              ))}
            </div>
          ) : (
            <div style={proseStyle}>
              <p>Los envíos se realizan a través de servicios de correo privado. Una vez confirmado y acreditado el pago, el pedido se prepara en un plazo de <strong>1 a 2 días hábiles</strong>.</p>
              <p>Los tiempos de entrega indicados en la tabla son aproximados desde el momento del despacho y pueden variar según la zona y la disponibilidad del correo.</p>
              <p>Una vez despachado el pedido, te enviamos el número de seguimiento por WhatsApp para que puedas rastrearlo.</p>
              <p>En caso de no encontrarte en el domicilio, el correo dejará un aviso y realizará un segundo intento de entrega. Pasados los intentos, el paquete quedará disponible en la sucursal más cercana por un plazo de <strong>5 días hábiles</strong>.</p>
            </div>
          )}
        </section>

        {/* Política de cambios */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={h2Style}>Cambios y devoluciones</h2>
          {config?.politicaCambios ? (
            <div style={proseStyle}>
              {config.politicaCambios.split('\n').map((p, i) => (
                <p key={i} style={{ margin: '0 0 12px' }}>{p}</p>
              ))}
            </div>
          ) : (
            <div style={proseStyle}>
              <p>Aceptamos cambios dentro de los <strong>10 días corridos</strong> desde la recepción del pedido, siempre que el producto esté sin uso, con etiquetas y en su embalaje original.</p>
              <p>Para iniciar un cambio, escribinos por WhatsApp indicando tu número de pedido y el motivo. El costo del envío de devolución corre por cuenta del comprador, salvo que el producto presente un defecto de fabricación.</p>
              <p><strong>No realizamos devoluciones en efectivo.</strong> En caso de cambio, podés elegir otro producto de igual o mayor valor (abonando la diferencia) o un crédito para tu próxima compra.</p>
              <p>Quedan excluidos de cambios los productos en liquidación o con descuento especial, salvo defecto de fabricación.</p>
            </div>
          )}
        </section>

        {/* Retiro en local */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={h2Style}>Retiro en local</h2>
          <div style={{ background: '#f7f4f0', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
              📍 {config?.direccionLocal ?? 'Esquiú 620, Catamarca'}
            </p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px' }}>
              {config?.horarioLocal ?? 'Lunes a Sábados: 9:00–13:30 hs / 18:00–22:00 hs'}
            </p>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
              El retiro en local no tiene costo adicional. Coordinamos por WhatsApp el horario de retiro una vez confirmado el pago.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid #f0ede8' }}>
          <p style={{ fontSize: 14, color: '#888', margin: '0 0 20px' }}>
            ¿Tenés alguna duda? Escribinos directamente.
          </p>
          <a
            href={`https://wa.me/${config?.whatsapp ?? '5493834644467'}?text=${encodeURIComponent('Hola! Tengo una consulta sobre envíos y cambios.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', color: '#fff',
              padding: '12px 24px', borderRadius: 8,
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}
          >
            💬 Consultar por WhatsApp
          </a>
        </section>

      </div>
    </div>
  );
}

const h2Style = {
  fontSize: 20, fontWeight: 800, color: '#111',
  letterSpacing: '-0.01em', margin: '0 0 20px',
};

const proseStyle = {
  fontSize: 14, color: '#555', lineHeight: 1.8,
};