'use client';
// src/app/checkout/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, MapPin, Truck, CreditCard, Smartphone, CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';

const COSTO_ENVIO = 3500;
const ENVIO_GRATIS_DESDE = 50000;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotal, clearCart } = useCart();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumenAbierto, setResumenAbierto] = useState(false);

  // Tipo de entrega
  const [tipoEnvio, setTipoEnvio] = useState('retiro'); // 'retiro' | 'envio'

  // Método de pago
  const [metodoPago, setMetodoPago] = useState(''); // 'mercadopago' | 'transferencia' | 'efectivo'

  // Datos del comprador
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    // Dirección (solo si envio)
    calle: '',
    numero: '',
    piso: '',
    depto: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    notas: '',
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        setForm(prev => ({
          ...prev,
          nombre: user.user_metadata?.nombre ?? user.user_metadata?.full_name ?? '',
          email: user.email ?? '',
        }));
      }
    });
  }, []);

  // Redirigir si carrito vacío
  useEffect(() => {
    if (cart.length === 0) router.replace('/productos');
  }, [cart]);

  const subtotal = getTotal();
  const costoEnvioFinal = tipoEnvio === 'envio'
    ? (subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO)
    : 0;
  const total = subtotal + costoEnvioFinal;

  // ── Validación ────────────────────────────────────────────
  function validar() {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'Requerido';
    if (!form.email.trim())    e.email    = 'Requerido';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';

    if (tipoEnvio === 'envio') {
      if (!form.calle.trim())        e.calle        = 'Requerido';
      if (!form.ciudad.trim())       e.ciudad       = 'Requerido';
      if (!form.provincia.trim())    e.provincia    = 'Requerido';
      if (!form.codigoPostal.trim()) e.codigoPostal = 'Requerido';
    }

    if (!metodoPago) e.metodoPago = 'Seleccioná un método de pago';

    setErrores(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        items: cart.map(item => ({
          productoId: item.id.includes('-') ? item.id.split('-')[0] : item.id,
          varianteId: item.varianteId ?? null,
          nombre:     item.nombre,
          precio:     item.precio,
          cantidad:   item.cantidad,
          subtotal:   item.precio * item.cantidad,
          talle:      item.talle ?? null,
          color:      item.color ?? null,
          imagen:     item.imagen ?? null,
        })),
        subtotal,
        costoEnvio:  costoEnvioFinal,
        total,
        metodoPago,
        tipoEnvio,
        compradorNombre:   form.nombre.trim(),
        compradorEmail:    form.email.trim(),
        compradorTelefono: form.telefono.trim(),
        notas: form.notas.trim() || null,
        ...(tipoEnvio === 'envio' && {
          direccion: {
            calle:        form.calle.trim(),
            numero:       form.numero.trim() || null,
            piso:         form.piso.trim()   || null,
            departamento: form.depto.trim()  || null,
            ciudad:       form.ciudad.trim(),
            provincia:    form.provincia.trim(),
            codigoPostal: form.codigoPostal.trim(),
          },
        }),
      };

      const res  = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!data.ok) { setError(data.error ?? 'Error al procesar el pedido'); return; }

      if (metodoPago === 'mercadopago' && data.mpInitPoint) {
        // Redirigir a Mercado Pago
        window.location.href = data.mpInitPoint;
      } else {
        // Pago manual → página de éxito
        clearCart();
        router.push(`/checkout/exito?pedido=${data.pedidoId}`);
      }
    } catch (err) {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f2', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e5e0', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', color: '#111', textTransform: 'uppercase' }}>HOKY</span>
          </Link>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Checkout</span>
          <Link href="/productos" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Seguir comprando
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'flex-start' }}>

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Resumen móvil toggle */}
          <div style={{ display: 'none' }}>
            <button type="button" onClick={() => setResumenAbierto(!resumenAbierto)} style={{
              width: '100%', background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12,
              padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={15} /> Ver resumen ({cart.length} productos)
              </span>
              <span style={{ fontWeight: 800 }}>${total.toLocaleString('es-AR')}</span>
            </button>
          </div>

          {/* Datos personales */}
          <Section titulo="1. Tus datos">
            <div style={gridDos}>
              <Campo label="Nombre completo *" error={errores.nombre}>
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Juan Pérez" style={inputStyle(errores.nombre)} />
              </Campo>
              <Campo label="Teléfono / WhatsApp *" error={errores.telefono}>
                <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="+54 9 383 000-0000" style={inputStyle(errores.telefono)} />
              </Campo>
            </div>
            <Campo label="Email *" error={errores.email}>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com" style={inputStyle(errores.email)} />
            </Campo>
          </Section>

          {/* Tipo de entrega */}
          <Section titulo="2. Entrega">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <OpcionCard
                activo={tipoEnvio === 'retiro'}
                onClick={() => setTipoEnvio('retiro')}
                icon={<MapPin size={20} />}
                titulo="Retiro en local"
                desc="Esquiú 620, Catamarca"
                badge="Gratis"
                badgeColor="#16a34a"
              />
              <OpcionCard
                activo={tipoEnvio === 'envio'}
                onClick={() => setTipoEnvio('envio')}
                icon={<Truck size={20} />}
                titulo="Envío a domicilio"
                desc={subtotal >= ENVIO_GRATIS_DESDE ? '¡Envío gratis!' : `$${COSTO_ENVIO.toLocaleString('es-AR')}`}
                badge={subtotal >= ENVIO_GRATIS_DESDE ? 'Gratis' : null}
                badgeColor="#16a34a"
              />
            </div>

            {tipoEnvio === 'retiro' && (
              <div style={{ background: '#f7f4f0', borderRadius: 10, padding: '14px 16px', marginTop: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>📍 Dónde retirás</p>
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Esquiú 620 (antes de Rivadavia), Catamarca</p>
                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>Lun–Sáb: 9:00–13:30 / 18:00–22:00 hs</p>
              </div>
            )}

            {tipoEnvio === 'envio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <Campo label="Calle *" error={errores.calle}>
                  <input value={form.calle} onChange={e => setForm(p => ({ ...p, calle: e.target.value }))}
                    placeholder="Av. Belgrano" style={inputStyle(errores.calle)} />
                </Campo>
                <div style={gridDos}>
                  <Campo label="Número">
                    <input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
                      placeholder="1234" style={inputStyle()} />
                  </Campo>
                  <Campo label="Piso / Depto">
                    <input value={form.piso} onChange={e => setForm(p => ({ ...p, piso: e.target.value }))}
                      placeholder="3° B" style={inputStyle()} />
                  </Campo>
                </div>
                <div style={gridDos}>
                  <Campo label="Ciudad *" error={errores.ciudad}>
                    <input value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))}
                      placeholder="San Fernando del V. C." style={inputStyle(errores.ciudad)} />
                  </Campo>
                  <Campo label="Provincia *" error={errores.provincia}>
                    <input value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))}
                      placeholder="Catamarca" style={inputStyle(errores.provincia)} />
                  </Campo>
                </div>
                <Campo label="Código Postal *" error={errores.codigoPostal}>
                  <input value={form.codigoPostal} onChange={e => setForm(p => ({ ...p, codigoPostal: e.target.value }))}
                    placeholder="4700" style={{ ...inputStyle(errores.codigoPostal), maxWidth: 160 }} />
                </Campo>
              </div>
            )}
          </Section>

          {/* Método de pago */}
          <Section titulo="3. Método de pago">
            {errores.metodoPago && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 8px' }}>{errores.metodoPago}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <OpcionPago
                activo={metodoPago === 'mercadopago'}
                onClick={() => setMetodoPago('mercadopago')}
                icon="💳"
                titulo="Mercado Pago"
                desc="Tarjeta de crédito, débito, efectivo en puntos de pago"
              />
              <OpcionPago
                activo={metodoPago === 'transferencia'}
                onClick={() => setMetodoPago('transferencia')}
                icon="🏦"
                titulo="Transferencia bancaria"
                desc="Te enviamos los datos por WhatsApp"
              />
              <OpcionPago
                activo={metodoPago === 'efectivo'}
                onClick={() => setMetodoPago('efectivo')}
                icon="💵"
                titulo="Efectivo"
                desc={tipoEnvio === 'retiro' ? 'Al retirar en el local' : 'Al recibir el pedido'}
              />
            </div>
          </Section>

          {/* Notas */}
          <Section titulo="4. Notas (opcional)">
            <textarea
              value={form.notas}
              onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              placeholder="Aclaraciones sobre el pedido, horario de entrega preferido, etc."
              rows={3}
              style={{ ...inputStyle(), resize: 'none' }}
            />
          </Section>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
              <AlertCircle size={16} color="#ef4444" />
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', background: loading ? '#555' : '#111',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            letterSpacing: '0.04em',
          }}>
            {loading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
              : metodoPago === 'mercadopago'
                ? <>💳 Pagar con Mercado Pago — ${total.toLocaleString('es-AR')}</>
                : <><CheckCircle size={18} /> Confirmar pedido — ${total.toLocaleString('es-AR')}</>
            }
          </button>

          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: 0 }}>
            Al confirmar aceptás nuestros términos. Nos contactaremos para coordinar el pago/entrega.
          </p>

        </form>

        {/* ── Resumen ── */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0ede8' }}>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: 0 }}>
                Tu pedido
              </p>
            </div>

            {/* Items */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 360, overflowY: 'auto' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #f0ede8' }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={18} color="#ccc" />
                      </div>
                    )}
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#111', color: '#fff', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{item.cantidad}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
                    {(item.talle || item.color) && (
                      <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 2px' }}>
                        {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0ede8', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
                <span>Envío</span>
                <span style={{ color: costoEnvioFinal === 0 ? '#16a34a' : '#111', fontWeight: costoEnvioFinal === 0 ? 700 : 400 }}>
                  {tipoEnvio === 'retiro' ? 'Retiro gratis' : costoEnvioFinal === 0 ? '¡Gratis!' : `$${COSTO_ENVIO.toLocaleString('es-AR')}`}
                </span>
              </div>
              {tipoEnvio === 'envio' && subtotal < ENVIO_GRATIS_DESDE && (
                <p style={{ fontSize: 11, color: '#aaa', margin: 0, textAlign: 'right' }}>
                  Envío gratis desde ${ENVIO_GRATIS_DESDE.toLocaleString('es-AR')}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#111', paddingTop: 8, borderTop: '1px solid #f0ede8', marginTop: 4 }}>
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────

function Section({ titulo, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>{titulo}</p>
      {children}
    </div>
  );
}

function Campo({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>{error}</p>}
    </div>
  );
}

function OpcionCard({ activo, onClick, icon, titulo, desc, badge, badgeColor }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '16px', border: `2px solid ${activo ? '#111' : '#e0dbd5'}`,
      borderRadius: 12, background: activo ? '#111' : '#fff',
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ color: activo ? '#fff' : '#555' }}>{icon}</span>
        {badge && (
          <span style={{ fontSize: 9, fontWeight: 700, background: badgeColor, color: '#fff', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: activo ? '#fff' : '#111', margin: '0 0 2px' }}>{titulo}</p>
      <p style={{ fontSize: 11, color: activo ? 'rgba(255,255,255,0.65)' : '#888', margin: 0 }}>{desc}</p>
    </button>
  );
}

function OpcionPago({ activo, onClick, icon, titulo, desc }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '14px 16px', border: `2px solid ${activo ? '#111' : '#e0dbd5'}`,
      borderRadius: 10, background: activo ? '#fafaf8' : '#fff',
      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.15s',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 8, background: activo ? '#111' : '#f5f4f2',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{titulo}</p>
        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{desc}</p>
      </div>
      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${activo ? '#111' : '#ddd'}`, background: activo ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {activo && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );
}

const gridDos = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

const inputStyle = (error) => ({
  width: '100%', padding: '10px 12px',
  border: `1px solid ${error ? '#fca5a5' : '#e0dbd5'}`,
  borderRadius: 8, fontSize: 13, outline: 'none',
  boxSizing: 'border-box', color: '#111', background: '#fff',
});