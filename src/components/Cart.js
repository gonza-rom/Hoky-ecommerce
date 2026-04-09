'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const ENVIO_GRATIS_DESDE = 150000;

export default function Cart() {
  const {
    cart,
    isOpen,
    setIsOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  } = useCart();

  if (!isOpen) return null;

  const total    = getTotal();
  const falta    = Math.max(0, ENVIO_GRATIS_DESDE - total);
  const progreso = Math.min((total / ENVIO_GRATIS_DESDE) * 100, 100);
  const gratis   = total >= ENVIO_GRATIS_DESDE;

  const fmt = (n) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(n);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">

        {/* Header */}
        <div style={{ padding: 16, borderBottom: '1px solid #e8e5e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={18} color="#fff" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Mi Carrito ({cart.length})</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Banner envío gratis ── */}
        <div style={{
          padding: '10px 14px',
          background: gratis ? '#f0fdf4' : '#fafaf8',
          borderBottom: `1px solid ${gratis ? '#bbf7d0' : '#f0ede8'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={13} color={gratis ? '#16a34a' : '#888'} />
              {gratis ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                  ¡Envío gratis desbloqueado!
                </span>
              ) : (
                <span style={{ fontSize: 14, color: '#555' }}>
                  Agregá <strong style={{ color: '#111' }}>{fmt(falta)}</strong> para envío gratis
                </span>
              )}
            </div>
            <span style={{ fontSize: 13, color: '#000000ff' }}>{fmt(ENVIO_GRATIS_DESDE)}</span>
          </div>

          {/* Barra de progreso */}
          <div style={{
            height: 5,
            background: '#e5e7eb',
            borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progreso}%`,
              background: gratis
                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                : 'linear-gradient(90deg, #111, #444)',
              borderRadius: 99,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', gap: 12 }}>
              <ShoppingBag size={48} color="#ddd" />
              <p style={{ fontSize: 15, margin: 0 }}>Tu carrito está vacío</p>
              <p style={{ fontSize: 13, margin: 0, color: '#ccc' }}>Agregá productos para empezar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid #f0ede8' }}>

                  {/* Imagen */}
                  <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f4f2' }}>
                    {item.imagen ? (
                      <Image src={item.imagen} alt={item.nombre} fill className="object-cover" sizes="72px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={24} color="#ddd" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.nombre}
                    </p>
                    {(item.talle || item.color) && (
                      <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px' }}>
                        {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
                      ${item.precio.toLocaleString('es-AR')}
                    </p>

                    {/* Controles cantidad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e0dbd5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e0dbd5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 6, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={12} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>
                      ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #f0ede8', padding: 16, background: '#fafaf8', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Envío */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#888' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Truck size={13} />
                Envío
              </span>
              <span style={{ fontWeight: 600, color: gratis ? '#16a34a' : '#888' }}>
                {gratis ? 'Gratis' : 'Se calcula al finalizar'}
              </span>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#111' }}>
                ${total.toLocaleString('es-AR')}
              </span>
            </div>

            {/* Botón checkout */}
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block', width: '100%', background: '#111', color: '#fff',
                padding: '13px', borderRadius: 8, textAlign: 'center',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              Ir al checkout →
            </Link>

            {/* WhatsApp */}
            <button
              onClick={() => {
                const items = cart.map((item, i) => {
                  const varInfo = [item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' ');
                  return `${i + 1}. *${item.nombre}*${varInfo ? ` (${varInfo})` : ''} x${item.cantidad} — $${(item.precio * item.cantidad).toLocaleString('es-AR')}`;
                }).join('\n');
                const msg = `¡Hola! Quiero hacer este pedido:\n\n${items}\n\n*Total: $${total.toLocaleString('es-AR')}*\n\n¿Pueden confirmar disponibilidad?`;
                window.open(`https://wa.me/5493834644467?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              style={{
                width: '100%', background: '#25D366', color: '#fff',
                padding: '11px', borderRadius: 8, border: 'none',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Consultar por WhatsApp
            </button>

            <button
              onClick={clearCart}
              style={{ background: 'transparent', border: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer', padding: '4px 0' }}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}