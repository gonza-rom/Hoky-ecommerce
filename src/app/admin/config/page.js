'use client';
// src/app/admin/config/page.js

import { useState, useEffect } from 'react';
import { Save, Loader2, CreditCard, Truck, MapPin, MessageCircle, FileText } from 'lucide-react';

const FORM_VACIO = {
  mpPublicKey:      '',
  mpAccessToken:    '',
  mpWebhookSecret:  '',
  costoEnvioBase:   '',
  envioGratisDesde: '',
  zonaEnvio:        '',
  montoMinimo:      '',
  permitirRetiro:   true,
  direccionLocal:   '',
  horarioLocal:     '',
  whatsapp:         '',
  instagram:        '',
  email:            '',
  bannerTexto:      '',
  politicaEnvio:    '',
  politicaCambios:  '',
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
          mpAccessToken:    '',           // nunca pre-llenamos el token por seguridad
          mpWebhookSecret:  '',           // ídem
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
    } catch { /* primera vez sin config — form vacío está bien */ }
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? 'Error al guardar'); return; }
      setExito('Configuración guardada correctamente');
      // Limpiar campos de secrets para que no queden visibles
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
    <div style={{ padding: 48, textAlign: 'center' }}>
      <Loader2 size={28} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Configuración</h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Ajustes generales de la tienda</p>
        </div>
        <button onClick={guardar} disabled={guardando} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#111', color: '#fff', border: 'none',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1,
        }}>
          {guardando
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
            : <><Save size={14} /> Guardar cambios</>
          }
        </button>
      </div>

      {exito && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
          ✅ {exito}
        </div>
      )}
      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
          ❌ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Mercado Pago ── */}
        <Seccion icon={CreditCard} titulo="Mercado Pago">
          <Campo label="Public Key">
            <input value={form.mpPublicKey} onChange={set('mpPublicKey')}
              placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={inp} />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="Access Token" hint="Dejá vacío para no cambiar el guardado">
              <input type="password" value={form.mpAccessToken} onChange={set('mpAccessToken')}
                placeholder="● ● ● ● ● ● ● ●" style={inp} autoComplete="off" />
            </Campo>
            <Campo label="Webhook Secret" hint="Dejá vacío para no cambiar el guardado">
              <input type="password" value={form.mpWebhookSecret} onChange={set('mpWebhookSecret')}
                placeholder="● ● ● ● ● ● ● ●" style={inp} autoComplete="off" />
            </Campo>
          </div>
          <div style={{ background: '#f7f4f0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#888' }}>
            💡 Webhook URL para configurar en MP:{' '}
            <code style={{ fontSize: 11, background: '#ede8e3', padding: '2px 6px', borderRadius: 4 }}>
              {typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}/api/webhooks/mercadopago
            </code>
          </div>
        </Seccion>

        {/* ── Envío ── */}
        <Seccion icon={Truck} titulo="Envío">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Campo label="Costo de envío ($)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }}>$</span>
                <input type="number" value={form.costoEnvioBase} onChange={set('costoEnvioBase')}
                  placeholder="3500" min="0" style={{ ...inp, paddingLeft: 22 }} />
              </div>
            </Campo>
            <Campo label="Envío gratis desde ($)" hint="Vacío = sin envío gratis">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }}>$</span>
                <input type="number" value={form.envioGratisDesde} onChange={set('envioGratisDesde')}
                  placeholder="50000" min="0" style={{ ...inp, paddingLeft: 22 }} />
              </div>
            </Campo>
            <Campo label="Compra mínima ($)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }}>$</span>
                <input type="number" value={form.montoMinimo} onChange={set('montoMinimo')}
                  placeholder="0" min="0" style={{ ...inp, paddingLeft: 22 }} />
              </div>
            </Campo>
          </div>
          <Campo label="Zonas / descripción del envío">
            <textarea value={form.zonaEnvio} onChange={set('zonaEnvio')} rows={2}
              placeholder="Ej: Envíos a todo el país. Capital: 24-48hs. Interior: 3-5 días hábiles."
              style={{ ...inp, resize: 'none' }} />
          </Campo>
        </Seccion>

        {/* ── Retiro en local ── */}
        <Seccion icon={MapPin} titulo="Retiro en local">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>
            <input type="checkbox" checked={form.permitirRetiro} onChange={set('permitirRetiro')} />
            Permitir retiro en local
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="Dirección del local">
              <input value={form.direccionLocal} onChange={set('direccionLocal')}
                placeholder="Esquiú 620, Catamarca" style={inp} />
            </Campo>
            <Campo label="Horario">
              <input value={form.horarioLocal} onChange={set('horarioLocal')}
                placeholder="Lun–Sáb: 9:00–13:30 / 18:00–22:00" style={inp} />
            </Campo>
          </div>
        </Seccion>

        {/* ── Contacto y redes ── */}
        <Seccion icon={MessageCircle} titulo="Contacto y redes">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="WhatsApp (con código de país)">
              <input value={form.whatsapp} onChange={set('whatsapp')}
                placeholder="5493834644467" style={inp} />
            </Campo>
            <Campo label="Email">
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="hoky@mail.com" style={inp} />
            </Campo>
          </div>
          <Campo label="Instagram (URL completa)">
            <input value={form.instagram} onChange={set('instagram')}
              placeholder="https://www.instagram.com/hoky.indumentaria" style={inp} />
          </Campo>
        </Seccion>

        {/* ── Textos ── */}
        <Seccion icon={FileText} titulo="Textos de la tienda">
          <Campo label="Texto del banner (ticker superior)">
            <input value={form.bannerTexto} onChange={set('bannerTexto')}
              placeholder="ENVÍOS A TODO EL PAÍS · NUEVA COLECCIÓN OTOÑO 2026" style={inp} />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="Política de envío">
              <textarea value={form.politicaEnvio} onChange={set('politicaEnvio')} rows={4}
                placeholder="Descripción de la política de envío..."
                style={{ ...inp, resize: 'vertical' }} />
            </Campo>
            <Campo label="Política de cambios y devoluciones">
              <textarea value={form.politicaCambios} onChange={set('politicaCambios')} rows={4}
                placeholder="Descripción de la política de cambios..."
                style={{ ...inp, resize: 'vertical' }} />
            </Campo>
          </div>
        </Seccion>

      </div>

      {/* Botón guardar inferior (para no tener que scrollear) */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={guardar} disabled={guardando} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#111', color: '#fff', border: 'none',
          padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700,
          cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1,
        }}>
          {guardando
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
            : <><Save size={15} /> Guardar cambios</>
          }
        </button>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function Seccion({ icon: Icon, titulo, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderBottom: '1px solid #f0ede8', background: '#fafaf8',
      }}>
        <Icon size={15} color="#888" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {titulo}
        </span>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Campo({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{hint}</p>}
    </div>
  );
}

const inp = {
  width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5',
  borderRadius: 8, fontSize: 13, outline: 'none',
  boxSizing: 'border-box', color: '#111', background: '#fff',
};