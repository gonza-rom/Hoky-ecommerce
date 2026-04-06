'use client';
// src/app/checkout/page.js

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingBag, MapPin, Truck, CheckCircle,
  Loader2, AlertCircle, ChevronDown, ChevronUp, Copy, Check, Info,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { calcularEnvio, PROVINCIAS_AR, ENVIO_GRATIS_DESDE } from '@/lib/envio';

const TRANSFERENCIA = {
  titular: 'Hoky Indumentaria',
  banco:   'Banco Galicia',
  cbu:     '0070999820000012345678',
  alias:   'HOKY.INDUMENTARIA',
};

const WA_NUMBER = '5493834644467';

export default function CheckoutPage() {
  const router   = useRouter();
  const { cart, getTotal, clearCart } = useCart();
  const supabase = createClient();

  const pedidoConfirmado = useRef(false);

  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [tipoEnvio,  setTipoEnvio]  = useState('retiro');
  const [metodoPago, setMetodoPago] = useState('');
  const [errores,    setErrores]    = useState({});
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [copiado,    setCopiado]    = useState('');
  const [infoEnvio,  setInfoEnvio]  = useState(null); // resultado de calcularEnvio()

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', numero: '', piso: '', depto: '',
    ciudad: '', provincia: '', codigoPostal: '',
    notas: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        setForm(prev => ({
          ...prev,
          nombre: user.user_metadata?.nombre ?? user.user_metadata?.full_name ?? '',
          email:  user.email ?? '',
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !pedidoConfirmado.current) {
      router.replace('/productos');
    }
  }, [cart, router]);

  // Recalcular envío cada vez que cambia la provincia o el subtotal
  useEffect(() => {
    if (tipoEnvio === 'envio' && form.provincia) {
      const resultado = calcularEnvio(form.provincia, subtotal);
      setInfoEnvio(resultado);
    } else {
      setInfoEnvio(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.provincia, tipoEnvio]);

  const subtotal        = getTotal();
  const costoEnvioFinal = tipoEnvio === 'retiro'
    ? 0
    : (infoEnvio?.disponible ? infoEnvio.precio : 0);
  const total = subtotal + costoEnvioFinal;

  function copiar(campo) {
    const valor = campo === 'cbu' ? TRANSFERENCIA.cbu : TRANSFERENCIA.alias;
    navigator.clipboard.writeText(valor).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(''), 2000);
    });
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'Requerido';
    if (!form.email.trim())    e.email    = 'Requerido';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    if (tipoEnvio === 'envio') {
      if (!form.calle.trim())        e.calle        = 'Requerido';
      if (!form.ciudad.trim())       e.ciudad       = 'Requerido';
      if (!form.provincia)           e.provincia    = 'Requerido';
      if (!form.codigoPostal.trim()) e.codigoPostal = 'Requerido';
      if (infoEnvio && !infoEnvio.disponible) e.provincia = 'Provincia no reconocida';
    }
    if (!metodoPago) e.metodoPago = 'Seleccioná un método de pago';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

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
          talle:      item.talle  ?? null,
          color:      item.color  ?? null,
          imagen:     item.imagen ?? null,
        })),
        subtotal,
        costoEnvio: costoEnvioFinal,
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
            numero:       form.numero.trim()  || null,
            piso:         form.piso.trim()    || null,
            departamento: form.depto.trim()   || null,
            ciudad:       form.ciudad.trim(),
            provincia:    form.provincia,
            codigoPostal: form.codigoPostal.trim(),
          },
        }),
      };

      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.ok) { setError(data.error ?? 'Error al procesar el pedido'); return; }

      pedidoConfirmado.current = true;

      if (metodoPago === 'mercadopago' && data.mpInitPoint) {
        clearCart();
        window.location.href = data.mpInitPoint;
      } else {
        clearCart();
        router.push(`/checkout/exito?pedido=${data.pedidoId}&metodo=${metodoPago}`);
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0 && !pedidoConfirmado.current) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f2', fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .co-grid {
          max-width: 1100px; margin: 0 auto;
          padding: 24px 16px;
          display: grid; grid-template-columns: 1fr; gap: 20px;
        }
        @media (min-width: 900px) {
          .co-grid { grid-template-columns: 1fr 360px; padding: 32px 24px; gap: 32px; }
        }
        .co-sticky { position: static; }
        @media (min-width: 900px) { .co-sticky { position: sticky; top: 24px; } }
        .co-g2 { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 480px) { .co-g2 { grid-template-columns: 1fr 1fr; } }
        .co-toggle { display: flex; }
        @media (min-width: 900px) { .co-toggle { display: none; } }
        .co-resumen-mobile { display: none; }
        .co-resumen-mobile.open { display: block; }
        @media (min-width: 900px) { .co-resumen-mobile { display: block !important; } }
      `}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e5e0', padding: '14px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '0.12em', color: '#111', textTransform: 'uppercase' }}>HOKY</span>
          </Link>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Checkout</span>
          <Link href="/productos" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', textDecoration: 'none' }}>
            <ArrowLeft size={13} /> Volver
          </Link>
        </div>
      </div>

      <div className="co-grid">

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Toggle resumen móvil */}
          <div className="co-toggle">
            <button type="button" onClick={() => setResumenAbierto(!resumenAbierto)} style={{
              width: '100%', background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12,
              padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={15} />
                {resumenAbierto ? 'Ocultar resumen' : `Ver resumen (${cart.reduce((a, i) => a + i.cantidad, 0)} productos)`}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>${total.toLocaleString('es-AR')}</strong>
                {resumenAbierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
          </div>

          <div className={`co-resumen-mobile ${resumenAbierto ? 'open' : ''}`}>
            <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, overflow: 'hidden' }}>
              <ResumenItems cart={cart} subtotal={subtotal} costoEnvioFinal={costoEnvioFinal}
                tipoEnvio={tipoEnvio} total={total} infoEnvio={infoEnvio} />
            </div>
          </div>

          {/* 1. Datos */}
          <Section titulo="1. Tus datos">
            <div className="co-g2">
              <Campo label="Nombre completo *" error={errores.nombre}>
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Juan Pérez" style={inp(errores.nombre)} />
              </Campo>
              <Campo label="Teléfono / WhatsApp *" error={errores.telefono}>
                <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="+54 9 383 000-0000" style={inp(errores.telefono)} />
              </Campo>
            </div>
            <Campo label="Email *" error={errores.email}>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com" style={inp(errores.email)} />
            </Campo>
          </Section>

          {/* 2. Entrega */}
          <Section titulo="2. Entrega">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <OpcionCard activo={tipoEnvio === 'retiro'} onClick={() => { setTipoEnvio('retiro'); setInfoEnvio(null); }}
                icon={<MapPin size={18} />} titulo="Retiro en local"
                desc="Esquiú 620, Catamarca" badge="Gratis" badgeColor="#16a34a" />
              <OpcionCard activo={tipoEnvio === 'envio'} onClick={() => setTipoEnvio('envio')}
                icon={<Truck size={18} />} titulo="Envío a domicilio"
                desc="Calculamos el costo según tu provincia" />
            </div>

            {tipoEnvio === 'retiro' && (
              <div style={{ background: '#f7f4f0', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>📍 Dónde retirás</p>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Esquiú 620 (antes de Rivadavia), Catamarca</p>
                <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0' }}>Lun–Sáb: 9:00–13:30 / 18:00–22:00 hs</p>
              </div>
            )}

            {tipoEnvio === 'envio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Campo label="Calle *" error={errores.calle}>
                  <input value={form.calle} onChange={e => setForm(p => ({ ...p, calle: e.target.value }))}
                    placeholder="Av. Belgrano" style={inp(errores.calle)} />
                </Campo>
                <div className="co-g2">
                  <Campo label="Número">
                    <input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
                      placeholder="1234" style={inp()} />
                  </Campo>
                  <Campo label="Piso / Depto">
                    <input value={form.piso} onChange={e => setForm(p => ({ ...p, piso: e.target.value }))}
                      placeholder="3° B" style={inp()} />
                  </Campo>
                </div>
                <div className="co-g2">
                  <Campo label="Ciudad *" error={errores.ciudad}>
                    <input value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))}
                      placeholder="San Fernando del V. C." style={inp(errores.ciudad)} />
                  </Campo>
                  <Campo label="Provincia *" error={errores.provincia}>
                    {/* Select con todas las provincias */}
                    <select
                      value={form.provincia}
                      onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))}
                      style={{ ...inp(errores.provincia), background: '#fff' }}
                    >
                      <option value="">Seleccioná tu provincia</option>
                      {PROVINCIAS_AR.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </Campo>
                </div>
                <Campo label="Código Postal *" error={errores.codigoPostal}>
                  <input value={form.codigoPostal} onChange={e => setForm(p => ({ ...p, codigoPostal: e.target.value }))}
                    placeholder="4700" style={{ ...inp(errores.codigoPostal), maxWidth: 160 }} />
                </Campo>

                {/* ── Resultado del cálculo de envío ── */}
                {infoEnvio && (
                  <div style={{
                    borderRadius: 10, padding: '14px 16px',
                    background: infoEnvio.gratis ? '#f0fdf4' : infoEnvio.disponible ? '#eff6ff' : '#fff5f5',
                    border: `1px solid ${infoEnvio.gratis ? '#bbf7d0' : infoEnvio.disponible ? '#bfdbfe' : '#fecaca'}`,
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>
                      {infoEnvio.gratis ? '🎉' : infoEnvio.disponible ? '🚚' : '❌'}
                    </span>
                    <div>
                      <p style={{
                        fontSize: 13, fontWeight: 700, margin: '0 0 2px',
                        color: infoEnvio.gratis ? '#15803d' : infoEnvio.disponible ? '#1d4ed8' : '#dc2626',
                      }}>
                        {infoEnvio.gratis
                          ? `¡Envío gratis a ${infoEnvio.zona.nombre}!`
                          : infoEnvio.disponible
                            ? `Envío a ${infoEnvio.zona.nombre}: $${infoEnvio.precio.toLocaleString('es-AR')}`
                            : 'Provincia no encontrada'
                        }
                      </p>
                      {infoEnvio.disponible && (
                        <p style={{ fontSize: 12, color: '#555', margin: 0 }}>
                          ⏱ {infoEnvio.diasMin}–{infoEnvio.diasMax} días hábiles estimados
                        </p>
                      )}
                      {/* Mostrar cuánto falta para envío gratis si aplica a la zona */}
                      {infoEnvio.disponible && !infoEnvio.gratis && infoEnvio.zona.envioGratis && subtotal < ENVIO_GRATIS_DESDE && (
                        <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>
                          Agregá ${(ENVIO_GRATIS_DESDE - subtotal).toLocaleString('es-AR')} más para obtener envío gratis a tu zona
                        </p>
                      )}
                      {/* Info de que la zona no tiene envío gratis */}
                      {infoEnvio.disponible && !infoEnvio.zona.envioGratis && (
                        <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Info size={11} /> El envío gratis no aplica para esta zona
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabla de zonas desplegable */}
                <ZonasInfo subtotal={subtotal} />
              </div>
            )}
          </Section>

          {/* 3. Método de pago */}
          <Section titulo="3. Método de pago">
            {errores.metodoPago && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 8px' }}>{errores.metodoPago}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <OpcionPago activo={metodoPago === 'mercadopago'} onClick={() => setMetodoPago('mercadopago')}
                icon="💳" titulo="Mercado Pago" desc="Tarjeta, débito, efectivo en puntos de pago" />
              <OpcionPago activo={metodoPago === 'transferencia'} onClick={() => setMetodoPago('transferencia')}
                icon="🏦" titulo="Transferencia bancaria" desc="Transferí y envianos el comprobante por WhatsApp" />
              <OpcionPago activo={metodoPago === 'efectivo'} onClick={() => setMetodoPago('efectivo')}
                icon="💵" titulo="Efectivo"
                desc={tipoEnvio === 'retiro' ? 'Al retirar en el local' : 'Al recibir el pedido'} />
            </div>

            {metodoPago === 'transferencia' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px', marginTop: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15803d', margin: '0 0 12px' }}>
                  🏦 Datos para la transferencia
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <DatoTransferencia label="Titular" valor={TRANSFERENCIA.titular} />
                  <DatoTransferencia label="Banco"   valor={TRANSFERENCIA.banco} />
                  <DatoTransferencia label="CBU"     valor={TRANSFERENCIA.cbu}
                    onCopiar={() => copiar('cbu')} copiado={copiado === 'cbu'} />
                  <DatoTransferencia label="Alias"   valor={TRANSFERENCIA.alias}
                    onCopiar={() => copiar('alias')} copiado={copiado === 'alias'} />
                </div>
                <p style={{ fontSize: 11, color: '#15803d', margin: '12px 0 0' }}>
                  💬 Después de confirmar, envianos el comprobante por WhatsApp para acreditar el pago.
                </p>
              </div>
            )}
          </Section>

          {/* 4. Notas */}
          <Section titulo="4. Notas (opcional)">
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              placeholder="Aclaraciones, horario de entrega preferido, etc."
              rows={3} style={{ ...inp(), resize: 'none' }} />
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
          }}>
            {loading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
              : metodoPago === 'mercadopago'
                ? <>💳 Pagar con Mercado Pago — ${total.toLocaleString('es-AR')}</>
                : <><CheckCircle size={18} /> Confirmar pedido — ${total.toLocaleString('es-AR')}</>
            }
          </button>

          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: 0 }}>
            Los tiempos de entrega son estimados y pueden variar según la zona y el servicio de correo.
          </p>
        </form>

        {/* ── Resumen desktop ── */}
        <div className="co-sticky">
          <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f0ede8' }}>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: 0 }}>
                Tu pedido
              </p>
            </div>
            <ResumenItems cart={cart} subtotal={subtotal} costoEnvioFinal={costoEnvioFinal}
              tipoEnvio={tipoEnvio} total={total} infoEnvio={infoEnvio} />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Tabla de zonas info ───────────────────────────────────────
function ZonasInfo({ subtotal }) {
  const [abierto, setAbierto] = useState(false);
  const zonas = [
    { nombre: 'Local (Catamarca)',    precio: 4000,  diasMin: 1, diasMax: 2,  gratis: true },
    { nombre: 'NOA',                  precio: 6500,  diasMin: 2, diasMax: 4,  gratis: true },
    { nombre: 'Centro',               precio: 9000,  diasMin: 3, diasMax: 5,  gratis: false },
    { nombre: 'Litoral',              precio: 10500, diasMin: 4, diasMax: 6,  gratis: false },
    { nombre: 'Buenos Aires',         precio: 11000, diasMin: 3, diasMax: 5,  gratis: false },
    { nombre: 'Patagonia',            precio: 15000, diasMin: 5, diasMax: 8,  gratis: false },
  ];

  return (
    <div>
      <button type="button" onClick={() => setAbierto(!abierto)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
      }}>
        <Info size={12} />
        {abierto ? 'Ocultar tabla de precios' : 'Ver precios por zona'}
        {abierto ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {abierto && (
        <div style={{ marginTop: 10, border: '1px solid #e8e5e0', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: '#fafaf8', padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zona</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Costo</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Días</span>
          </div>
          {zonas.map((zona, i) => {
            const esGratis = zona.gratis && subtotal >= ENVIO_GRATIS_DESDE;
            return (
              <div key={zona.nombre} style={{
                padding: '10px 12px',
                display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8,
                borderTop: i > 0 ? '1px solid #f0ede8' : 'none',
                background: '#fff',
              }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{zona.nombre}</span>
                  {zona.gratis && (
                    <span style={{ fontSize: 10, color: '#16a34a', marginLeft: 6, fontWeight: 600 }}>✓ envío gratis</span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: esGratis ? '#16a34a' : '#111', textAlign: 'right' }}>
                  {esGratis ? 'Gratis' : `$${zona.precio.toLocaleString('es-AR')}`}
                </span>
                <span style={{ fontSize: 11, color: '#888', textAlign: 'right' }}>
                  {zona.diasMin}–{zona.diasMax} días
                </span>
              </div>
            );
          })}
          <div style={{ background: '#f0fdf4', padding: '8px 12px', borderTop: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 11, color: '#15803d', margin: 0 }}>
              🎉 Envío gratis en Local y NOA para compras desde ${ENVIO_GRATIS_DESDE.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dato transferencia ────────────────────────────────────────
function DatoTransferencia({ label, valor, onCopiar, copiado }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11, color: '#888', display: 'block' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'monospace', wordBreak: 'break-all' }}>{valor}</span>
      </div>
      {onCopiar && (
        <button type="button" onClick={onCopiar} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', border: '1px solid #bbf7d0', borderRadius: 6,
          background: copiado ? '#16a34a' : '#fff', cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: copiado ? '#fff' : '#16a34a',
          transition: 'all 0.2s',
        }}>
          {copiado ? <Check size={12} /> : <Copy size={12} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      )}
    </div>
  );
}

// ── Resumen items ─────────────────────────────────────────────
function ResumenItems({ cart, subtotal, costoEnvioFinal, tipoEnvio, total, infoEnvio }) {
  return (
    <>
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {item.imagen
                ? <img src={item.imagen} alt={item.nombre} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #f0ede8' }} />
                : <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={14} color="#ccc" />
                  </div>
              }
              <span style={{
                position: 'absolute', top: -5, right: -5,
                width: 16, height: 16, borderRadius: '50%',
                background: '#111', color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.cantidad}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
              {(item.talle || item.color) && (
                <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 1px' }}>
                  {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                </p>
              )}
              <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0 }}>${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #f0ede8', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
          <span>Subtotal</span><span>${subtotal.toLocaleString('es-AR')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
          <span>Envío</span>
          <span style={{ color: costoEnvioFinal === 0 && tipoEnvio === 'envio' ? '#16a34a' : '#555', fontWeight: costoEnvioFinal === 0 && tipoEnvio === 'envio' ? 700 : 400 }}>
            {tipoEnvio === 'retiro'
              ? 'Retiro gratis'
              : infoEnvio?.disponible
                ? infoEnvio.gratis
                  ? '¡Gratis!'
                  : `$${infoEnvio.precio.toLocaleString('es-AR')}`
                : 'Seleccioná provincia'
            }
          </span>
        </div>
        {infoEnvio?.disponible && (
          <p style={{ fontSize: 11, color: '#aaa', margin: 0, textAlign: 'right' }}>
            ⏱ {infoEnvio.diasMin}–{infoEnvio.diasMax} días hábiles
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#111', paddingTop: 8, borderTop: '1px solid #f0ede8', marginTop: 2 }}>
          <span>Total</span><span>${total.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </>
  );
}

function Section({ titulo, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: '#111', margin: 0 }}>{titulo}</p>
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
      padding: '12px', border: `2px solid ${activo ? '#111' : '#e0dbd5'}`,
      borderRadius: 10, background: activo ? '#111' : '#fff',
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color: activo ? '#fff' : '#555' }}>{icon}</span>
        {badge && <span style={{ fontSize: 9, fontWeight: 700, background: badgeColor, color: '#fff', padding: '2px 5px', borderRadius: 4, textTransform: 'uppercase' }}>{badge}</span>}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: activo ? '#fff' : '#111', margin: '0 0 2px' }}>{titulo}</p>
      <p style={{ fontSize: 11, color: activo ? 'rgba(255,255,255,0.65)' : '#888', margin: 0 }}>{desc}</p>
    </button>
  );
}

function OpcionPago({ activo, onClick, icon, titulo, desc }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '12px 14px', border: `2px solid ${activo ? '#111' : '#e0dbd5'}`,
      borderRadius: 10, background: activo ? '#fafaf8' : '#fff',
      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all 0.15s',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: activo ? '#111' : '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 1px' }}>{titulo}</p>
        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{desc}</p>
      </div>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${activo ? '#111' : '#ddd'}`, background: activo ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {activo && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );
}

const inp = (error) => ({
  width: '100%', padding: '10px 12px',
  border: `1px solid ${error ? '#fca5a5' : '#e0dbd5'}`,
  borderRadius: 8, fontSize: 13, outline: 'none',
  boxSizing: 'border-box', color: '#111', background: '#fff',
});