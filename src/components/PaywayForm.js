// src/components/PaywayForm.js
// Formulario de tarjeta — los datos van al backend que tokeniza con SDK Node
// Sin SDK JS de Decidir, sin dependencias externas en el frontend
'use client';

import { useState } from 'react';
import { CreditCard, Lock, Loader2, AlertCircle } from 'lucide-react';

function detectarTarjeta(numero) {
  const n = numero.replace(/\s/g, '');
  if (/^4/.test(n))      return { nombre: 'Visa',       id: 1,  color: '#1a1f71' };
  if (/^5[1-5]/.test(n)) return { nombre: 'Mastercard', id: 25, color: '#eb001b' };
  if (/^3[47]/.test(n))  return { nombre: 'Amex',       id: 65, color: '#2e77bc' };
  if (/^589562/.test(n)) return { nombre: 'Naranja',    id: 24, color: '#ff6900' };
  return null;
}

function formatearNumero(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatearVto(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

const fmt = (n) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
}).format(n ?? 0);

export default function PaywayForm({ total, pedidoId, compradorEmail, onSuccess, onError }) {
  const [numero,  setNumero]  = useState('');
  const [nombre,  setNombre]  = useState('');
  const [vto,     setVto]     = useState('');
  const [cvv,     setCvv]     = useState('');
  const [cuotas,  setCuotas]  = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const tarjeta = detectarTarjeta(numero);

  async function pagar(e) {
    e.preventDefault();
    setError('');

    const numLimpio = numero.replace(/\s/g, '');
    if (numLimpio.length < 15) { setError('Número de tarjeta inválido'); return; }
    if (!nombre.trim())         { setError('Ingresá el nombre del titular'); return; }
    if (vto.length < 5)         { setError('Fecha de vencimiento inválida'); return; }
    if (cvv.length < 3)         { setError('Código de seguridad inválido'); return; }

    setLoading(true);

    try {
      // vto viene como MM/AA → convertir a MMAA
      const [mes, anio] = vto.split('/');
      const expDate = `${mes}${anio}`; // ej: "1230"

      const res = await fetch('/api/payway/pago', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          compradorEmail,
          total,
          installments:    cuotas,
          paymentMethodId: tarjeta?.id || 1,
          bin:             numLimpio.slice(0, 6),
          // datos de tarjeta — el backend los tokeniza con SDK Node
          cardData: {
            card_number:     numLimpio,
            expiration_date: expDate,
            card_holder:     nombre.trim(),
            security_code:   cvv,
            account_number:  numLimpio,
            email_holder:    compradorEmail || 'comprador@hoky.com',
          },
        }),
      });

      const data = await res.json();

      if (data.ok) {
        onSuccess?.(data);
      } else {
        setError(data.error || 'El pago fue rechazado. Verificá los datos e intentá de nuevo.');
        onError?.(data);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
      onError?.({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white';

  return (
    <form onSubmit={pagar} className="flex flex-col gap-4">

      {/* Número de tarjeta */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Número de tarjeta *</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={numero}
            onChange={e => setNumero(formatearNumero(e.target.value))}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className={inp + ' pr-24 font-mono'}
            autoComplete="cc-number"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {tarjeta
              ? <span className="text-xs font-bold" style={{ color: tarjeta.color }}>{tarjeta.nombre}</span>
              : <CreditCard size={16} className="text-gray-300" />
            }
          </div>
        </div>
      </div>

      {/* Nombre titular */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del titular *</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value.toUpperCase())}
          placeholder="COMO FIGURA EN LA TARJETA"
          className={inp + ' uppercase'}
          autoComplete="cc-name"
        />
      </div>

      {/* Vencimiento + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Vencimiento *</label>
          <input
            type="text"
            inputMode="numeric"
            value={vto}
            onChange={e => setVto(formatearVto(e.target.value))}
            placeholder="MM/AA"
            maxLength={5}
            className={inp + ' font-mono'}
            autoComplete="cc-exp"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">CVV *</label>
          <input
            type="text"
            inputMode="numeric"
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
            className={inp + ' font-mono'}
            autoComplete="cc-csc"
          />
        </div>
      </div>

      {/* Cuotas */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cuotas</label>
        <select
          value={cuotas}
          onChange={e => setCuotas(Number(e.target.value))}
          className={inp + ' bg-white'}
        >
          <option value={1}>1 cuota sin interés</option>
          <option value={3}>3 cuotas sin interés</option>
          <option value={6}>6 cuotas sin interés</option>
        </select>
      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock size={12} />
        <span>Tus datos viajan cifrados por HTTPS. No almacenamos datos de tarjeta.</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#111] hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Procesando pago...</>
          : `Pagar con tarjeta · ${fmt(total)}`
        }
      </button>
    </form>
  );
}