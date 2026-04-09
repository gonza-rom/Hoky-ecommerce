'use client';
// src/app/checkout/page.js

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingBag, MapPin, Truck, CheckCircle,
  Loader2, AlertCircle, ChevronRight, Store, Package,
  CreditCard, Banknote, Building2, Tag, X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { calcularEnvio, PROVINCIAS_AR, ENVIO_GRATIS_DESDE } from '@/lib/envio';

const DESCUENTO_DEFAULT = 10;

function getPrecioItem(item, metodoPago) {
  if (metodoPago === 'efectivo' || metodoPago === 'transferencia') {
    if (item.precioEfectivo) return item.precioEfectivo;
    const descuento = item.descuentoEfectivo ?? DESCUENTO_DEFAULT;
    return Math.round(item.precio * (1 - descuento / 100));
  }
  return item.precio;
}

const fmt = (n) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
}).format(n ?? 0);

const TRANSFERENCIA = {
  titular: 'Hoky Indumentaria',
  banco:   'Banco Galicia',
  cbu:     '0070999820000012345678',
  alias:   'HOKY.INDUMENTARIA',
};

// ── Barra de pasos ────────────────────────────────────────────────────────────
function StepBar({ paso }) {
  const pasos = ['Contacto', 'Entrega', 'Pago'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {pasos.map((label, i) => {
        const num    = i + 1;
        const activo = paso === num;
        const hecho  = paso > num;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                hecho  ? 'bg-[#111] border-[#111] text-white' :
                activo ? 'bg-white border-[#111] text-[#111]' :
                         'bg-white border-gray-300 text-gray-400'
              }`}>
                {hecho ? <CheckCircle size={14} /> : num}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${activo ? 'text-[#111]' : hecho ? 'text-[#111]' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${paso > num ? 'bg-[#111]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Resumen lateral ───────────────────────────────────────────────────────────
function ResumenLateral({ cart, subtotal, costoEnvio, total, tipoEnvio, infoEnvio, metodoPago, ahorroTotal, tieneDescuento }) {
  const [cuponInput, setCuponInput] = useState('');
  const [mostrarCupon, setMostrarCupon] = useState(false);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Productos */}
      <div className="p-5 flex flex-col gap-3 max-h-64 overflow-y-auto">
        {cart.map(item => {
          const precioFinal = getPrecioItem(item, metodoPago);
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                {item.imagen
                  ? <img src={item.imagen} alt={item.nombre} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  : <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center"><ShoppingBag size={14} className="text-gray-400" /></div>
                }
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.cantidad}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                {(item.talle || item.color) && (
                  <p className="text-xs text-gray-400">{[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}</p>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{fmt(precioFinal * item.cantidad)}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200" />

      {/* Cupón */}
      <div className="px-5 py-3">
        {!mostrarCupon ? (
          <button onClick={() => setMostrarCupon(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <Tag size={14} />
            Agregar cupón de descuento
          </button>
        ) : (
          <div className="flex gap-2">
            <input value={cuponInput} onChange={e => setCuponInput(e.target.value)}
              placeholder="Código de cupón" autoFocus
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400" />
            <button className="px-3 py-2 bg-[#111] text-white text-sm font-semibold rounded-lg">Aplicar</button>
            <button onClick={() => setMostrarCupon(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200" />

      {/* Totales */}
      <div className="p-5 flex flex-col gap-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {tieneDescuento && metodoPago && metodoPago !== 'mercadopago' && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Descuento ({metodoPago})</span>
            <span>- {fmt(ahorroTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Envío</span>
          <span className={costoEnvio === 0 && tipoEnvio ? 'text-green-600 font-medium' : ''}>
            {!tipoEnvio ? 'Calculando...' :
             tipoEnvio === 'retiro' ? 'Retiro gratis' :
             infoEnvio?.gratis ? '¡Gratis!' :
             infoEnvio?.disponible ? fmt(infoEnvio.precio) :
             'A calcular'}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Checkout principal ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router   = useRouter();
  const { cart, clearCart } = useCart();
  const supabase = createClient();
  const pedidoConfirmado = useRef(false);

  const [paso,      setPaso]      = useState(1); // 1, 2, 3
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [infoEnvio, setInfoEnvio] = useState(null);

  const [tipoEnvio,  setTipoEnvio]  = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [errores,    setErrores]    = useState({});
  const [copiado,    setCopiado]    = useState('');

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', numero: '', piso: '', depto: '',
    ciudad: '', provincia: '', codigoPostal: '',
    notas: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) setForm(prev => ({
        ...prev,
        nombre: user.user_metadata?.nombre ?? user.user_metadata?.full_name ?? '',
        email:  user.email ?? '',
      }));
    });
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !pedidoConfirmado.current) router.replace('/productos');
  }, [cart, router]);

  useEffect(() => {
    if (tipoEnvio === 'envio' && form.provincia) {
      setInfoEnvio(calcularEnvio(form.provincia, subtotal));
    } else {
      setInfoEnvio(null);
    }
  }, [form.provincia, tipoEnvio]);

  // ── Cálculo de totales ────────────────────────────────────
  const { subtotal, ahorroTotal, tieneDescuento } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + getPrecioItem(item, metodoPago) * item.cantidad, 0);
    const sinDesc = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    return { subtotal: sub, ahorroTotal: sinDesc - sub, tieneDescuento: sinDesc - sub > 0 };
  }, [cart, metodoPago]);

  const costoEnvio = tipoEnvio === 'retiro' ? 0 : (infoEnvio?.disponible ? infoEnvio.precio : 0);
  const total      = subtotal + costoEnvio;

  function copiar(campo) {
    const valor = campo === 'cbu' ? TRANSFERENCIA.cbu : TRANSFERENCIA.alias;
    navigator.clipboard.writeText(valor).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(''), 2000);
    });
  }

  // ── Validaciones por paso ─────────────────────────────────
  function validarPaso1() {
    const e = {};
    if (!form.email.trim())    e.email    = 'Requerido';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.codigoPostal.trim()) e.codigoPostal = 'Requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function validarPaso2() {
    const e = {};
    if (!tipoEnvio) e.tipoEnvio = 'Seleccioná una opción de entrega';
    if (!form.nombre.trim())   e.nombre   = 'Requerido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    if (tipoEnvio === 'envio') {
      if (!form.calle.trim())   e.calle    = 'Requerido';
      if (!form.ciudad.trim())  e.ciudad   = 'Requerido';
      if (!form.provincia)      e.provincia = 'Requerido';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function validarPaso3() {
    const e = {};
    if (!metodoPago) e.metodoPago = 'Seleccioná un método de pago';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function irAPaso2() {
    if (validarPaso1()) {
      // Pre-calcular envío con el CP ingresado
      if (form.codigoPostal) setTipoEnvio('');
      setPaso(2);
    }
  }

  function irAPaso3() {
    if (validarPaso2()) setPaso(3);
  }

  async function confirmar() {
    if (!validarPaso3()) return;
    setLoading(true); setError('');
    try {
      const payload = {
        items: cart.map(item => {
          const precioFinal = getPrecioItem(item, metodoPago);
          return {
            productoId: item.id.includes('-') ? item.id.split('-')[0] : item.id,
            varianteId: item.varianteId ?? null,
            nombre:     item.nombre,
            precio:     precioFinal,
            cantidad:   item.cantidad,
            subtotal:   precioFinal * item.cantidad,
            talle:      item.talle  ?? null,
            color:      item.color  ?? null,
            imagen:     item.imagen ?? null,
          };
        }),
        subtotal, costoEnvio, total,
        metodoPago, tipoEnvio,
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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
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
    } catch { setError('Error de conexión. Intentá de nuevo.'); }
    finally  { setLoading(false); }
  }

  if (cart.length === 0 && !pedidoConfirmado.current) return null;

  const inp = (err) => `w-full px-3 py-2.5 border ${err ? 'border-red-300' : 'border-gray-200'} rounded-lg text-sm outline-none focus:border-gray-400 bg-white`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-widest uppercase text-[#111] no-underline">HOKY</Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Checkout</span>
          <Link href="/productos" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 no-underline">
            <ArrowLeft size={13} /> Volver
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Columna izquierda ── */}
          <div>
            <StepBar paso={paso} />

            {/* ══ PASO 1: Contacto ══ */}
            {paso === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                <h2 className="text-base font-bold text-gray-900">Datos de contacto</h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">E-mail *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="tu@email.com" className={inp(errores.email)} />
                  {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-600">Quiero recibir ofertas y novedades por e-mail</span>
                </label>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Entrega</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Código Postal *</label>
                    <div className="flex gap-2">
                      <input value={form.codigoPostal} onChange={e => setForm(p => ({ ...p, codigoPostal: e.target.value }))}
                        placeholder="Ej: 4700" className={`${inp(errores.codigoPostal)} max-w-[160px]`} />
                      <button className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap">
                        No sé mi CP
                      </button>
                    </div>
                    {errores.codigoPostal && <p className="text-xs text-red-500 mt-1">{errores.codigoPostal}</p>}
                  </div>
                </div>

                <button onClick={irAPaso2}
                  className="w-full bg-[#111] hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                  Continuar
                </button>
              </div>
            )}

            {/* ══ PASO 2: Entrega ══ */}
            {paso === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                {/* Resumen contacto */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400">Contacto</p>
                    <p className="text-sm font-medium text-gray-900">{form.email}</p>
                  </div>
                  <button onClick={() => setPaso(1)} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Cambiar</button>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400">Enviar a</p>
                    <p className="text-sm font-medium text-gray-900">CP {form.codigoPostal}</p>
                  </div>
                  <button onClick={() => setPaso(1)} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Cambiar</button>
                </div>

                <h2 className="text-base font-bold text-gray-900">Datos personales</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre completo *</label>
                    <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      placeholder="Juan Pérez" className={inp(errores.nombre)} />
                    {errores.nombre && <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teléfono / WhatsApp *</label>
                    <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                      placeholder="+54 9 383 000-0000" className={inp(errores.telefono)} />
                    {errores.telefono && <p className="text-xs text-red-500 mt-1">{errores.telefono}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Método de entrega</h3>
                  {errores.tipoEnvio && <p className="text-xs text-red-500 mb-2">{errores.tipoEnvio}</p>}

                  <div className="flex flex-col gap-2">
                    {/* Retiro */}
                    <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${tipoEnvio === 'retiro' ? 'border-[#111] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="entrega" value="retiro" checked={tipoEnvio === 'retiro'} onChange={() => setTipoEnvio('retiro')} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store size={15} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900">Retirar en local</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">Gratis</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-5">Esquiú 620, Catamarca · Lun–Sáb 9–13:30 / 18–22hs</p>
                      </div>
                    </label>

                    {/* Envío */}
                    <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${tipoEnvio === 'envio' ? 'border-[#111] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="entrega" value="envio" checked={tipoEnvio === 'envio'} onChange={() => setTipoEnvio('envio')} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck size={15} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900">Envío a domicilio</span>
                          </div>
                          {infoEnvio?.disponible && (
                            <span className="text-sm font-bold text-gray-900">
                              {infoEnvio.gratis ? 'Gratis' : fmt(infoEnvio.precio)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-5">Se calcula según tu provincia</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Dirección — solo si elige envío */}
                {tipoEnvio === 'envio' && (
                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-gray-900">Dirección de entrega</h3>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Calle *</label>
                      <input value={form.calle} onChange={e => setForm(p => ({ ...p, calle: e.target.value }))}
                        placeholder="Av. Belgrano" className={inp(errores.calle)} />
                      {errores.calle && <p className="text-xs text-red-500 mt-1">{errores.calle}</p>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Número</label>
                        <input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
                          placeholder="1234" className={inp()} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Piso / Depto</label>
                        <input value={form.piso} onChange={e => setForm(p => ({ ...p, piso: e.target.value }))}
                          placeholder="3° B" className={inp()} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ciudad *</label>
                        <input value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))}
                          placeholder="San Fernando del V. C." className={inp(errores.ciudad)} />
                        {errores.ciudad && <p className="text-xs text-red-500 mt-1">{errores.ciudad}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Provincia *</label>
                        <select value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))}
                          className={inp(errores.provincia) + ' bg-white'}>
                          <option value="">Seleccioná</option>
                          {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {errores.provincia && <p className="text-xs text-red-500 mt-1">{errores.provincia}</p>}
                      </div>
                    </div>

                    {/* Info envío calculado */}
                    {infoEnvio && (
                      <div className={`rounded-xl p-3 flex items-start gap-2 ${infoEnvio.disponible ? infoEnvio.gratis ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                        <span className="text-base">{infoEnvio.gratis ? '🎉' : infoEnvio.disponible ? '🚚' : '❌'}</span>
                        <div>
                          <p className={`text-sm font-semibold ${infoEnvio.gratis ? 'text-green-700' : infoEnvio.disponible ? 'text-blue-700' : 'text-red-600'}`}>
                            {infoEnvio.gratis ? `¡Envío gratis a ${infoEnvio.zona?.nombre}!` :
                             infoEnvio.disponible ? `Envío a ${infoEnvio.zona?.nombre}: ${fmt(infoEnvio.precio)}` :
                             'Provincia no disponible'}
                          </p>
                          {infoEnvio.disponible && (
                            <p className="text-xs text-gray-500 mt-0.5">{infoEnvio.diasMin}–{infoEnvio.diasMax} días hábiles</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notas del pedido (opcional)</label>
                  <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                    rows={2} placeholder="Aclaraciones, horario preferido..." className={inp() + ' resize-none'} />
                </div>

                <button onClick={irAPaso3}
                  className="w-full bg-[#111] hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                  Continuar al pago
                </button>
              </div>
            )}

            {/* ══ PASO 3: Pago ══ */}
            {paso === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                {/* Resumen entrega */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400">Contacto</p>
                    <p className="text-sm font-medium text-gray-900">{form.email}</p>
                  </div>
                  <button onClick={() => setPaso(1)} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Cambiar</button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400">{tipoEnvio === 'retiro' ? 'Retiro en local' : 'Envío a domicilio'}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {tipoEnvio === 'retiro' ? 'Esquiú 620, Catamarca' : `${form.calle} ${form.numero}, ${form.ciudad}`}
                    </p>
                  </div>
                  <button onClick={() => setPaso(2)} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Cambiar</button>
                </div>

                <h2 className="text-base font-bold text-gray-900">Método de pago</h2>
                {errores.metodoPago && <p className="text-xs text-red-500">{errores.metodoPago}</p>}

                <div className="flex flex-col gap-2">
                  {[
                    { id: 'mercadopago',  icon: CreditCard,  label: 'Mercado Pago',          desc: 'Tarjeta, débito, efectivo en puntos de pago', badge: null },
                    { id: 'transferencia',icon: Building2,    label: 'Transferencia bancaria', desc: 'Transferí y envianos el comprobante', badge: `${Math.max(...cart.map(i => i.descuentoEfectivo ?? DESCUENTO_DEFAULT))}% OFF` },
                    { id: 'efectivo',     icon: Banknote,     label: 'Efectivo',              desc: tipoEnvio === 'retiro' ? 'Al retirar en el local' : 'Al recibir el pedido', badge: `${Math.max(...cart.map(i => i.descuentoEfectivo ?? DESCUENTO_DEFAULT))}% OFF` },
                  ].map(({ id, icon: Icon, label, desc, badge }) => (
                    <label key={id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${metodoPago === id ? 'border-[#111] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="pago" value={id} checked={metodoPago === id} onChange={() => setMetodoPago(id)} />
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{label}</span>
                          {badge && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{badge}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Datos de transferencia */}
                {metodoPago === 'transferencia' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Datos para transferir</p>
                    {[
                      { label: 'Titular', value: TRANSFERENCIA.titular },
                      { label: 'Banco',   value: TRANSFERENCIA.banco },
                      { label: 'CBU',     value: TRANSFERENCIA.cbu,   campo: 'cbu' },
                      { label: 'Alias',   value: TRANSFERENCIA.alias, campo: 'alias' },
                    ].map(({ label, value, campo }) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] text-gray-500">{label}</p>
                          <p className="text-xs font-bold text-gray-900 font-mono">{value}</p>
                        </div>
                        {campo && (
                          <button onClick={() => copiar(campo)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all flex-shrink-0 ${copiado === campo ? 'bg-green-600 text-white' : 'bg-white border border-green-300 text-green-700'}`}>
                            {copiado === campo ? '✓' : 'Copiar'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tieneDescuento && metodoPago && metodoPago !== 'mercadopago' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <Tag size={13} className="text-green-600" />
                    <p className="text-sm text-green-700 font-medium">
                      Ahorrás <strong>{fmt(ahorroTotal)}</strong> pagando con {metodoPago}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button onClick={confirmar} disabled={loading}
                  className="w-full bg-[#111] hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                    : metodoPago === 'mercadopago'
                      ? `Pagar con Mercado Pago · ${fmt(total)}`
                      : `Confirmar pedido · ${fmt(total)}`
                  }
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Al confirmar aceptás los términos y condiciones de compra.
                </p>
              </div>
            )}
          </div>

          {/* ── Resumen lateral (siempre visible) ── */}
          <div className="lg:sticky lg:top-6">
            <ResumenLateral
              cart={cart}
              subtotal={subtotal}
              costoEnvio={costoEnvio}
              total={total}
              tipoEnvio={tipoEnvio}
              infoEnvio={infoEnvio}
              metodoPago={metodoPago}
              ahorroTotal={ahorroTotal}
              tieneDescuento={tieneDescuento}
            />
          </div>

        </div>
      </div>
    </div>
  );
}