'use client';
// src/app/admin/config/page.js

import { useState, useEffect } from 'react';
import { Save, Loader2, CreditCard, Truck, MapPin, MessageCircle, FileText } from 'lucide-react';

const FORM_VACIO = {
  mpPublicKey: '', mpAccessToken: '', mpWebhookSecret: '',
  costoEnvioBase: '', envioGratisDesde: '', zonaEnvio: '', montoMinimo: '',
  permitirRetiro: true, direccionLocal: '', horarioLocal: '',
  whatsapp: '', instagram: '', email: '',
  bannerTexto: '', politicaEnvio: '', politicaCambios: '',
};

export default function AdminConfigPage() {
  const [form,      setForm]      = useState(FORM_VACIO);
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito,     setExito]     = useState('');
  const [error,     setError]     = useState('');

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.ok && data.data) {
        const c = data.data;
        setForm({
          mpPublicKey:      c.mpPublicKey      ?? '',
          mpAccessToken:    '',
          mpWebhookSecret:  '',
          costoEnvioBase:   c.costoEnvioBase   != null ? String(c.costoEnvioBase)   : '',
          envioGratisDesde: c.envioGratisDesde != null ? String(c.envioGratisDesde) : '',
          zonaEnvio:        c.zonaEnvio        ?? '',
          montoMinimo:      c.montoMinimo      != null ? String(c.montoMinimo)       : '',
          permitirRetiro:   c.permitirRetiro   ?? true,
          direccionLocal:   c.direccionLocal   ?? '',
          horarioLocal:     c.horarioLocal     ?? '',
          whatsapp:         c.whatsapp         ?? '',
          instagram:        c.instagram        ?? '',
          email:            c.email            ?? '',
          bannerTexto:      c.bannerTexto      ?? '',
          politicaEnvio:    c.politicaEnvio    ?? '',
          politicaCambios:  c.politicaCambios  ?? '',
        });
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function guardar() {
    setGuardando(true); setError(''); setExito('');
    try {
      const payload = {
        ...form,
        costoEnvioBase:   form.costoEnvioBase   !== '' ? parseFloat(form.costoEnvioBase)   : 0,
        envioGratisDesde: form.envioGratisDesde !== '' ? parseFloat(form.envioGratisDesde) : null,
        montoMinimo:      form.montoMinimo      !== '' ? parseFloat(form.montoMinimo)      : 0,
      };
      const res  = await fetch('/api/admin/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? 'Error al guardar'); return; }
      setExito('Configuración guardada correctamente');
      setForm(p => ({ ...p, mpAccessToken: '', mpWebhookSecret: '' }));
      setTimeout(() => setExito(''), 4000);
    } catch { setError('Error de conexión'); }
    finally { setGuardando(false); }
  }

  const set = campo => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [campo]: val }));
  };

  if (loading) return (
    <div className="p-12 text-center">
      <Loader2 size={28} className="text-gray-300 animate-spin mx-auto" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Configuración</h1>
          <p className="text-sm text-gray-400">Ajustes generales de la tienda</p>
        </div>
        <BtnGuardar onClick={guardar} loading={guardando} />
      </div>

      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700 font-semibold">
          {exito}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">

        {/* Mercado Pago */}
        <Seccion icon={CreditCard} titulo="Mercado Pago">
          <Campo label="Public Key">
            <input value={form.mpPublicKey} onChange={set('mpPublicKey')}
              placeholder="APP_USR-xxxxxxxx..." className={inp} />
          </Campo>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Access Token" hint="Dejá vacío para no cambiar">
              <input type="password" value={form.mpAccessToken} onChange={set('mpAccessToken')}
                placeholder="● ● ● ● ●" className={inp} autoComplete="off" />
            </Campo>
            <Campo label="Webhook Secret" hint="Dejá vacío para no cambiar">
              <input type="password" value={form.mpWebhookSecret} onChange={set('mpWebhookSecret')}
                placeholder="● ● ● ● ●" className={inp} autoComplete="off" />
            </Campo>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-400 break-all">
            Webhook URL: <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">
              {typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}/api/webhooks/mercadopago
            </code>
          </div>
        </Seccion>

        {/* Envío */}
        <Seccion icon={Truck} titulo="Envío">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Campo label="Costo de envío ($)">
              <PrecioInput value={form.costoEnvioBase} onChange={set('costoEnvioBase')} placeholder="3500" />
            </Campo>
            <Campo label="Envío gratis desde ($)" hint="Vacío = sin envío gratis">
              <PrecioInput value={form.envioGratisDesde} onChange={set('envioGratisDesde')} placeholder="50000" />
            </Campo>
            <Campo label="Compra mínima ($)">
              <PrecioInput value={form.montoMinimo} onChange={set('montoMinimo')} placeholder="0" />
            </Campo>
          </div>
          <Campo label="Zonas / descripción del envío">
            <textarea value={form.zonaEnvio} onChange={set('zonaEnvio')} rows={2}
              placeholder="Ej: Envíos a todo el país. Capital: 24-48hs."
              className={`${inp} resize-none`} />
          </Campo>
        </Seccion>

        {/* Retiro */}
        <Seccion icon={MapPin} titulo="Retiro en local">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" checked={form.permitirRetiro} onChange={set('permitirRetiro')} className="w-4 h-4" />
            Permitir retiro en local
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Dirección del local">
              <input value={form.direccionLocal} onChange={set('direccionLocal')}
                placeholder="Esquiú 620, Catamarca" className={inp} />
            </Campo>
            <Campo label="Horario">
              <input value={form.horarioLocal} onChange={set('horarioLocal')}
                placeholder="Lun–Sáb: 9:00–13:30 / 18:00–22:00" className={inp} />
            </Campo>
          </div>
        </Seccion>

        {/* Contacto */}
        <Seccion icon={MessageCircle} titulo="Contacto y redes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="WhatsApp (con código de país)">
              <input value={form.whatsapp} onChange={set('whatsapp')}
                placeholder="5493834644467" className={inp} />
            </Campo>
            <Campo label="Email">
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="hoky@mail.com" className={inp} />
            </Campo>
          </div>
          <Campo label="Instagram (URL completa)">
            <input value={form.instagram} onChange={set('instagram')}
              placeholder="https://www.instagram.com/hoky.indumentaria" className={inp} />
          </Campo>
        </Seccion>

        {/* Textos */}
        <Seccion icon={FileText} titulo="Textos de la tienda">
          <Campo label="Texto del banner">
            <input value={form.bannerTexto} onChange={set('bannerTexto')}
              placeholder="ENVÍOS A TODO EL PAÍS · NUEVA COLECCIÓN" className={inp} />
          </Campo>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Política de envío">
              <textarea value={form.politicaEnvio} onChange={set('politicaEnvio')} rows={4}
                placeholder="Descripción de la política de envío..."
                className={`${inp} resize-vertical`} />
            </Campo>
            <Campo label="Política de cambios y devoluciones">
              <textarea value={form.politicaCambios} onChange={set('politicaCambios')} rows={4}
                placeholder="Descripción de la política de cambios..."
                className={`${inp} resize-vertical`} />
            </Campo>
          </div>
        </Seccion>

      </div>

      {/* Botón inferior */}
      <div className="mt-6 flex justify-end">
        <BtnGuardar onClick={guardar} loading={guardando} />
      </div>
    </div>
  );
}

function BtnGuardar({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 bg-[#111] text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-gray-800 transition-colors flex-shrink-0">
      {loading
        ? <><Loader2 size={13} className="animate-spin" /> Guardando...</>
        : <><Save size={13} /> Guardar cambios</>
      }
    </button>
  );
}

function Seccion({ icon: Icon, titulo, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <Icon size={14} className="text-gray-400" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{titulo}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Campo({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function PrecioInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
      <input type="number" value={value} onChange={onChange} placeholder={placeholder} min="0"
        className={`${inp} pl-6`} />
    </div>
  );
}

const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white text-[#111] box-border';