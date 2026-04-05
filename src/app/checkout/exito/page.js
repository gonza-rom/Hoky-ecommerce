'use client';
// src/app/checkout/exito/page.js

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, MapPin, MessageCircle, ArrowRight } from 'lucide-react';

function ExitoContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido');
  const status   = searchParams.get('status'); // de MercadoPago

  const esMercadoPago = !!status;
  const aprobado      = status === 'approved' || !status; // sin status = pago manual aprobado

  if (!aprobado) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
          <h1 style={tituloStyle}>Pago no completado</h1>
          <p style={subStyle}>
            {status === 'pending'
              ? 'Tu pago está pendiente de acreditación. Te avisaremos cuando se confirme.'
              : 'No se pudo procesar tu pago. Podés intentarlo nuevamente.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            <Link href="/checkout" style={btnPrimary}>Intentar de nuevo</Link>
            <Link href="/productos" style={btnSecondary}>Ver productos</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Check animado */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#f0fdf4', border: '2px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <CheckCircle size={40} color="#16a34a" />
        </div>

        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px', textAlign: 'center' }}>
          {esMercadoPago ? 'Pago confirmado' : 'Pedido recibido'}
        </p>

        <h1 style={tituloStyle}>¡Gracias por tu compra!</h1>

        {pedidoId && (
          <div style={{ background: '#f7f4f0', borderRadius: 10, padding: '12px 20px', margin: '16px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>N° de pedido</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '0.05em' }}>
              #{pedidoId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <p style={subStyle}>
          {esMercadoPago
            ? 'Tu pago fue procesado correctamente. Te enviamos la confirmación por email.'
            : 'Recibimos tu pedido. Nos pondremos en contacto pronto para coordinar el pago y la entrega.'}
        </p>

        {/* Próximos pasos */}
        <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: '20px', margin: '24px 0', textAlign: 'left' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: '0 0 16px' }}>
            Próximos pasos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📧', texto: 'Revisá tu email con el resumen del pedido' },
              { icon: '📱', texto: 'Te contactamos por WhatsApp para coordinar' },
              { icon: '📦', texto: esMercadoPago ? 'Preparamos tu pedido y lo enviamos' : 'Confirmamos el pago y preparamos tu pedido' },
            ].map(({ icon, texto }) => (
              <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <p style={{ fontSize: 13, color: '#555', margin: 0 }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a
            href={`https://wa.me/5493834644467?text=${encodeURIComponent(`Hola! Hice un pedido${pedidoId ? ` (#${pedidoId.slice(-8).toUpperCase()})` : ''} y quería confirmar.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...btnPrimary, background: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <MessageCircle size={16} /> Contactar por WhatsApp
          </a>
          <Link href="/productos" style={{ ...btnSecondary, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ShoppingBag size={14} /> Seguir comprando
          </Link>
          {pedidoId && (
            <Link href="/cuenta" style={{ fontSize: 13, color: '#888', textAlign: 'center', textDecoration: 'none' }}>
              Ver mis pedidos →
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CheckoutExitoPage() {
  return (
    <Suspense fallback={null}>
      <ExitoContent />
    </Suspense>
  );
}

const pageStyle = {
  minHeight: '100vh', background: '#f5f4f2',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 24, fontFamily: "'Inter', sans-serif",
};
const cardStyle = {
  background: '#fff', borderRadius: 20, border: '1px solid #e8e5e0',
  padding: '40px 36px', width: '100%', maxWidth: 480,
  boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
  textAlign: 'center',
};
const tituloStyle = { fontSize: 24, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-0.02em' };
const subStyle    = { fontSize: 14, color: '#888', margin: 0, lineHeight: 1.7 };
const btnPrimary  = { display: 'block', width: '100%', padding: '13px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center' };
const btnSecondary = { display: 'block', width: '100%', padding: '12px', background: 'transparent', color: '#555', border: '1px solid #e0dbd5', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center' };