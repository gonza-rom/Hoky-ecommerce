// src/components/PaywayForm.js
'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function PaywayForm({ total, pedidoId, compradorEmail, compradorNombre, tipoEnvio, direccion, items, onSuccess, onError }) {
  const [numero,   setNumero]   = useState('');
  const [nombre,   setNombre]   = useState('');
  const [vto,      setVto]      = useState('');
  const [cvv,      setCvv]      = useState('');
  const [docTipo,  setDocTipo]  = useState('dni');
  const [docNum,   setDocNum]   = useState('');
  const [cuotas,   setCuotas]   = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [sdkListo, setSdkListo] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const formRef = useRef(null);

  // Generar fingerprint único del dispositivo
  const tarjeta   = detectarTarjeta(numero);
  const bin       = numero.replace(/\s/g, '').slice(0, 6);
  const publicKey = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
  const isProd    = process.env.NEXT_PUBLIC_PAYWAY_ENVIRONMENT === 'production';

  // URLs correctas según la doc oficial de Payway
  const urlPayway = isProd
    ? 'https://ventasonline.payway.com.ar/api/v2'
    : 'https://developers-ventasonline.payway.com.ar/api/v2';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Decidir) { setSdkListo(true); return; }
    if (document.getElementById('payway-sdk')) return;

    // Script oficial de Payway Ventas Online
    // Generar Device Fingerprint con script oficial de Cybersource/Payway
    const sessionId = pedidoId || Math.random().toString(36).slice(2);
    setDeviceFingerprint(sessionId);

    // Cargar el script de Cybersource para device fingerprinting
    const orgId = '1snn5n9w'; // Org ID de Cybersource para Payway producción
    const csImg = document.createElement('img');
    csImg.src = `https://h.online-metrix.net/fp/clear.png?org_id=${orgId}&session_id=${sessionId}&m=1`;
    csImg.style.display = 'none';
    document.body.appendChild(csImg);

    const csScript = document.createElement('script');
    csScript.src = `https://h.online-metrix.net/fp/tags.js?org_id=${orgId}&session_id=${sessionId}`;
    csScript.async = true;
    document.head.appendChild(csScript);

    const script    = document.createElement('script');
    script.id       = 'payway-sdk';
    script.src      = 'https://ventasonline.payway.com.ar/static/v2.6.4/decidir.js';
    script.onload   = () => setSdkListo(true);
    script.onerror  = () => setError('No se pudo cargar el SDK de Payway');
    document.head.appendChild(script);
  }, []);

  async function pagar(e) {
    e.preventDefault();
    setError('');

    const numLimpio = numero.replace(/\s/g, '');
    if (numLimpio.length < 15) { setError('Número de tarjeta inválido'); return; }
    if (!nombre.trim())         { setError('Ingresá el nombre del titular'); return; }
    if (vto.length < 5)         { setError('Fecha de vencimiento inválida'); return; }
    if (cvv.length < 3)         { setError('Código de seguridad inválido'); return; }
    if (!docNum.trim())         { setError('Ingresá tu número de documento'); return; }
    if (!sdkListo || !window.Decidir) { setError('SDK de Payway no disponible, recargá la página'); return; }

    setLoading(true);

    try {
      const token = await new Promise((resolve, reject) => {
        // inhabilitarCS = true → desactiva Cybersource (evita el llamado a frauddetectionconf)
        const inhabilitarCS = true;
        const siteId = process.env.NEXT_PUBLIC_PAYWAY_SITE_ID || '93021573';
        const decidir = new window.Decidir(urlPayway, inhabilitarCS);
        decidir.setPublishableKey(publicKey);
        decidir.setTimeout(10000);

        decidir.createToken(formRef.current, (status, response) => {
          console.log('Payway token status:', status, JSON.stringify(response));
          if (status === 200 || status === 201) {
            resolve(response.id);
          } else {
            const errores = Array.isArray(response)
              ? response.map(e => e.error?.message || e.param).join(', ')
              : response?.error_type || response?.message || `Error ${status}`;
            reject(new Error(errores));
          }
        });
      });

      // Enviar token al backend para procesar el pago
      const res = await fetch('/api/payway/pago', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          token,
          bin,
          paymentMethodId: tarjeta?.id || 1,
          installments:    cuotas,
          total,
          compradorEmail,
          compradorNombre,
          tipoEnvio,
          direccion,
          items,
          deviceFingerprint,
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
    <form ref={formRef} onSubmit={pagar} className="flex flex-col gap-4">

      {/* Inputs ocultos con data-decidir — el SDK los lee del formRef */}
      <input type="hidden" data-decidir="card_number"            value={numero.replace(/\s/g, '')}  readOnly />
      <input type="hidden" data-decidir="card_expiration_month"  value={vto.split('/')[0] || ''}    readOnly />
      <input type="hidden" data-decidir="card_expiration_year"   value={vto.split('/')[1] || ''}    readOnly />
      <input type="hidden" data-decidir="security_code"          value={cvv}                         readOnly />
      <input type="hidden" data-decidir="card_holder_name"       value={nombre}                      readOnly />
      <input type="hidden" data-decidir="card_holder_doc_type"   value={docTipo}                     readOnly />
      <input type="hidden" data-decidir="card_holder_doc_number" value={docNum}                      readOnly />

      {/* Número de tarjeta */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Número de tarjeta *</label>
        <div className="relative">
          <input
            type="text" inputMode="numeric"
            value={numero} onChange={e => setNumero(formatearNumero(e.target.value))}
            placeholder="0000 0000 0000 0000" maxLength={19}
            className={inp + ' pr-24 font-mono'} autoComplete="cc-number"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {tarjeta
              ? <span className="text-xs font-bold" style={{ color: tarjeta.color }}>{tarjeta.nombre}</span>
              : <CreditCard size={16} className="text-gray-300" />
            }
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del titular *</label>
        <input
          type="text" value={nombre}
          onChange={e => setNombre(e.target.value.toUpperCase())}
          placeholder="COMO FIGURA EN LA TARJETA"
          className={inp + ' uppercase'} autoComplete="cc-name"
        />
      </div>

      {/* Vencimiento + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Vencimiento *</label>
          <input
            type="text" inputMode="numeric" value={vto}
            onChange={e => setVto(formatearVto(e.target.value))}
            placeholder="MM/AA" maxLength={5}
            className={inp + ' font-mono'} autoComplete="cc-exp"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">CVV *</label>
          <input
            type="text" inputMode="numeric" value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123" maxLength={4}
            className={inp + ' font-mono'} autoComplete="cc-csc"
          />
        </div>
      </div>

      {/* Documento */}
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tipo doc.</label>
          <select value={docTipo} onChange={e => setDocTipo(e.target.value)} className={inp + ' bg-white'}>
            <option value="dni">DNI</option>
            <option value="cuil">CUIL</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Número de documento *</label>
          <input
            type="text" inputMode="numeric" value={docNum}
            onChange={e => setDocNum(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="12345678" className={inp + ' font-mono'}
          />
        </div>
      </div>

      {/* Cuotas */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cuotas</label>
        <select value={cuotas} onChange={e => setCuotas(Number(e.target.value))} className={inp + ' bg-white'}>
          <option value={1}>1 cuota sin interés</option>
          <option value={3}>3 cuotas sin interés</option>
          <option value={6}>6 cuotas sin interés</option>
        </select>
      </div>

      {/* Seguridad */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock size={12} />
        <span>Tus datos viajan cifrados. No almacenamos datos de tarjeta.</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Botón */}
      <button type="submit" disabled={loading || !sdkListo}
        className="w-full bg-[#111] hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Procesando pago...</>
          : sdkListo
            ? `Pagar con tarjeta · ${fmt(total)}`
            : 'Cargando...'
        }
      </button>
    </form>
  );
}