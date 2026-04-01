'use client';

import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';

const WHATSAPP = '5493834644467';
const INSTAGRAM = 'https://www.instagram.com/hoky.indumentaria';
const MAPS = 'https://maps.app.goo.gl/etsJBVaNJ4CVgaHMA';
const EMAIL = 'hoky.indumentaria@gmail.com';

export default function ContactoPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ background: '#111', color: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 12px' }}>
            Contacto
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 8vw, 72px)',
            lineHeight: 0.9, letterSpacing: '0.02em', margin: '0 0 20px',
          }}>
            HABLEMOS
          </h1>
          <p style={{ fontSize: 14, opacity: 0.5, lineHeight: 1.8, margin: 0 }}>
            Consultas, tallas, disponibilidad — escribinos y te respondemos rápido.
          </p>
        </div>
      </section>

      {/* Cards de contacto */}
      <section style={{ padding: '64px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              border: '0.5px solid #e0dbd5', padding: '28px 24px',
              transition: 'border-color 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0dbd5'}
            >
              <div style={{
                width: 40, height: 40, background: '#25D366',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 16,
              }}>
                <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px' }}>WhatsApp</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>+54 9 383 464-4467</p>
              <p style={{ fontSize: 12, color: '#25D366', margin: 0 }}>Escribinos →</p>
            </div>
          </a>

          {/* Instagram */}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              border: '0.5px solid #e0dbd5', padding: '28px 24px', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0dbd5'}
            >
              <div style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 16,
              }}>
                <Instagram size={18} color="#fff" />
              </div>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px' }}>Instagram</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>@hoky.indumentaria</p>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Ver perfil →</p>
            </div>
          </a>

          {/* Horarios */}
          <div style={{ border: '0.5px solid #e0dbd5', padding: '28px 24px' }}>
            <div style={{
              width: 40, height: 40, background: '#111',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 16,
            }}>
              <Clock size={18} color="#fff" />
            </div>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px' }}>Horarios</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Lunes a Sábados</p>
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.8 }}>
              9:00 — 13:30 hs<br />
              18:00 — 22:00 hs
            </p>
          </div>
        </div>
      </section>

      {/* Mapa + dirección */}
      <section style={{ padding: '0 24px 72px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '0.5px solid #e0dbd5' }}>

          {/* Info dirección */}
          <div style={{ padding: '40px 36px', background: '#111', color: '#fff' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 20px' }}>
              Dónde estamos
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
              <MapPin size={18} style={{ flexShrink: 0, marginTop: 2, opacity: 0.7 }} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Esquiú 620</p>
                <p style={{ fontSize: 13, opacity: 0.5, margin: 0 }}>
                  Antes de llegar a Rivadavia<br />
                  San Fernando del V. de Catamarca
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 32 }}>
              <Clock size={18} style={{ flexShrink: 0, marginTop: 2, opacity: 0.7 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>Lunes a Sábados</p>
                <p style={{ fontSize: 13, opacity: 0.5, margin: 0, lineHeight: 1.8 }}>
                  9:00 a 13:30 hs<br />
                  18:00 a 22:00 hs
                </p>
              </div>
            </div>
            <a
              href={MAPS}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#fff', color: '#111',
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '11px 22px', textDecoration: 'none', fontWeight: 700,
              }}
            >
              Abrir en Maps →
            </a>
          </div>

          {/* Embed mapa */}
          <div style={{ minHeight: 300, background: '#e8e3dc', position: 'relative', overflow: 'hidden' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3534.!2d-65.78!3d-28.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942339a0b99a3b05%3A0xf7a6e9cf0b4a3c6a!2sEsqui%C3%BA%20620%2C%20San%20Fernando%20del%20Valle%20de%20Catamarca!5e0!3m2!1ses!2sar!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', inset: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hoky Indumentaria — Ubicación"
            />
          </div>
        </div>
      </section>
    </div>
  );
}