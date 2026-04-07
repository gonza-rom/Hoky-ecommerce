'use client';
// src/app/checkout/exito/page.js

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const TRANSFERENCIA = {
  titular: 'Hoky Indumentaria',
  banco:   'Banco Galicia',
  cbu:     '0070999820000012345678',
  alias:   'HOKY.INDUMENTARIA',
};

const WA_NUMBER = '5493834644467';

function DatoTransferencia({ label, valor, onCopiar, copiado }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11, color: '#888', display: 'block' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'monospace', wordBreak: 'break-all' }}>{valor}</span>
      </div>
      {onCopiar && (
        <button onClick={onCopiar} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', border: '1px solid #e0dbd5', borderRadius: 6,
          background: copiado ? '#111' : '#fff', cursor: 'pointer',
          fontSize: 11, fontWeight: 600,
          color: copiado ? '#fff' : '#555',
          transition: 'all 0.2s',
        }}>
          {copiado ? <Check size={12} /> : <Copy size={12} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      )}
    </div>
  );
}

function ExitoContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido');
  const metodo   = searchParams.get('metodo');   // transferencia | efectivo | mercadopago
  const status   = searchParams.get('status');   // de MercadoPago: approved | rejected | pending

  const [copiado, setCopiado] = useState('');

  function copiar(campo) {
    const valor = campo === 'cbu' ? TRANSFERENCIA.cbu : TRANSFERENCIA.alias;
    navigator.clipboard.writeText(valor).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(''), 2000);
    });
  }

  const esTransferencia = metodo === 'transferencia';
  const esMercadoPago   = !!status;
  const aprobado        = status === 'approved' || !status;

  // ── Pago rechazado ────────────────────────────────────────
  if (esMercadoPago && !aprobado) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 16 }}>❌</div>
          <h1 style={s.titulo}>Pago no completado</h1>
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 }}>
            {status === 'pending'
              ? 'Tu pago está pendiente de acreditación. Te avisaremos cuando se confirme.'
              : 'No se pudo procesar el pago. Podés intentarlo nuevamente.'}
          </p>
          <Link href="/checkout" style={s.btnPrimary}>Intentar de nuevo</Link>
          <Link href="/productos" style={{ ...s.btnSecundario, marginTop: 8 }}>Ver productos</Link>
        </div>
      </div>
    );
  }

  // ── Éxito ─────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Check */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#f0fdf4', border: '2px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CheckCircle size={36} color="#16a34a" />
        </div>

        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px', textAlign: 'center' }}>
          {esMercadoPago ? 'Pago confirmado' : 'Pedido recibido'}
        </p>

        <h1 style={s.titulo}>¡Gracias por tu compra!</h1>

        {pedidoId && (
          <div style={{ background: '#f7f4f0', borderRadius: 10, padding: '12px 20px', margin: '16px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>N° de pedido</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '0.05em' }}>
              #{pedidoId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        {/* ── Bloque especial para transferencia ── */}
        {esTransferencia && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px', margin: '8px 0 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15803d', margin: '0 0 12px' }}>
              🏦 Realizá la transferencia
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <DatoTransferencia label="Titular" valor={TRANSFERENCIA.titular} />
              <DatoTransferencia label="Banco"   valor={TRANSFERENCIA.banco} />
              <DatoTransferencia label="CBU"     valor={TRANSFERENCIA.cbu}
                onCopiar={() => copiar('cbu')} copiado={copiado === 'cbu'} />
              <DatoTransferencia label="Alias"   valor={TRANSFERENCIA.alias}
                onCopiar={() => copiar('alias')} copiado={copiado === 'alias'} />
              <DatoTransferencia label="Monto"
                valor={`$${parseInt(searchParams.get('total') ?? '0').toLocaleString('es-AR') || '(ver tu pedido)'}`} />
            </div>

            {/* Botón enviar comprobante por WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                `Hola! Hice una transferencia para el pedido #${pedidoId?.slice(-8).toUpperCase() ?? ''} en Hoky.\n\nTe mando el comprobante ahora.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px', borderRadius: 8,
                background: '#25D366', color: '#fff',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              <MessageCircle size={16} />
              Enviar comprobante por WhatsApp
            </a>
            <p style={{ fontSize: 11, color: '#15803d', margin: '10px 0 0', textAlign: 'center' }}>
              Tu pedido se confirma una vez que acreditemos el pago.
            </p>
          </div>
        )}

        {/* ── Próximos pasos ── */}
        {!esTransferencia && (
          <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: '16px', margin: '16px 0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: '0 0 12px' }}>
              Próximos pasos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📧', texto: 'Revisá tu email con el resumen del pedido' },
                { icon: '📱', texto: 'Te contactamos por WhatsApp para coordinar' },
                { icon: '📦', texto: esMercadoPago ? 'Preparamos y enviamos tu pedido' : 'Confirmamos el pago y preparamos tu pedido' },
              ].map(({ icon, texto }) => (
                <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <p style={{ fontSize: 13, color: '#555', margin: 0 }}>{texto}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Botones finales ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!esTransferencia && (
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                `Hola! Hice un pedido${pedidoId ? ` (#${pedidoId.slice(-8).toUpperCase()})` : ''} y quería confirmar.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...s.btnPrimary, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
            >
              <MessageCircle size={16} /> Contactar por WhatsApp
            </a>
          )}

          <Link href="/productos"
            style={{ ...s.btnSecundario, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
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

const s = {
  page:        { minHeight: '100vh', background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" },
  card:        { background: '#fff', borderRadius: 20, border: '1px solid #e8e5e0', padding: '36px 28px', width: '100%', maxWidth: 480, boxShadow: '0 4px 32px rgba(0,0,0,0.06)' },
  titulo:      { fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 4px', letterSpacing: '-0.02em', textAlign: 'center' },
  btnPrimary:  { display: 'block', width: '100%', padding: '13px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' },
  btnSecundario: { display: 'block', width: '100%', padding: '12px', background: 'transparent', color: '#555', border: '1px solid #e0dbd5', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' },
};