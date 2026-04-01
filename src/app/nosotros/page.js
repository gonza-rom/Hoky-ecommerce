'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Star, Award, TrendingUp } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ background: '#111', color: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.45, margin: '0 0 16px' }}>
            Quiénes somos
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(52px, 8vw, 80px)',
            lineHeight: 0.9,
            letterSpacing: '0.02em',
            margin: '0 0 24px',
          }}>
            HOKY<br />INDUMENTARIA
          </h1>
          <p style={{ fontSize: 15, opacity: 0.55, lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            Ropa urbana pensada para la calle. Estilo que se vive, calidad que se nota.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section style={{ padding: '72px 24px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 12px' }}>
          Nuestra historia
        </p>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 40, letterSpacing: '0.03em', margin: '0 0 28px', color: '#111',
        }}>
          NACIDOS EN LA CALLE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            'Hoky nació de una pasión simple: la ropa como forma de expresión. Creemos que lo que vestís dice quién sos antes de que abras la boca.',
            'Desde Catamarca, armamos una marca que mezcla la cultura urbana con la identidad del interior argentino. Sin pretensiones, con mucho carácter.',
            'Cada prenda que diseñamos pasa por una sola pregunta: ¿te la pondrías en la calle con orgullo? Si la respuesta es sí, va a la colección.',
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 15, lineHeight: 1.85, color: '#444', margin: 0 }}>{p}</p>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section style={{ background: '#f7f4f0', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 12px', textAlign: 'center' }}>
            Lo que nos mueve
          </p>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 40, letterSpacing: '0.03em', margin: '0 0 48px', color: '#111', textAlign: 'center',
          }}>
            NUESTROS VALORES
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
            {[
              { icon: Heart,     label: 'Pasión',       desc: 'Cada prenda la diseñamos con amor por lo que hacemos.' },
              { icon: Star,      label: 'Calidad',      desc: 'Materiales que duran, costuras que aguantan la calle.' },
              { icon: TrendingUp, label: 'Estilo',      desc: 'Tendencia sin perder identidad propia.' },
              { icon: Award,     label: 'Autenticidad', desc: 'Sin filtros, sin poses. Hoky es lo que ves.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, background: '#111', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Icon size={22} color="#fff" />
                </div>
                <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px', color: '#111' }}>
                  {label}
                </p>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local */}
      <section style={{ padding: '72px 24px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 12px' }}>
          Dónde encontrarnos
        </p>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 40, letterSpacing: '0.03em', margin: '0 0 32px', color: '#111',
        }}>
          NUESTRO LOCAL
        </h2>
        <div style={{
          border: '0.5px solid #e0dbd5', padding: '32px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>
            📍 Esquiú 620, Catamarca
          </p>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            (antes de llegar a Rivadavia)
          </p>
          <p style={{ fontSize: 14, color: '#888', margin: '8px 0 0', lineHeight: 1.8 }}>
            Lunes a Sábados<br />
            9:00 a 13:30 hs — 18:00 a 22:00 hs
          </p>
          <a
            href="https://maps.app.goo.gl/etsJBVaNJ4CVgaHMA"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: 16,
              background: '#111', color: '#fff',
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '11px 24px', textDecoration: 'none', width: 'fit-content', fontWeight: 700,
            }}
          >
            Cómo llegar →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#111', color: '#fff', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 12px' }}>
          Entrá al catálogo
        </p>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(40px, 6vw, 64px)', letterSpacing: '0.02em', margin: '0 0 28px',
        }}>
          ¿LISTO PARA VESTIRTE?
        </h2>
        <Link href="/productos" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff', color: '#111',
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '13px 28px', textDecoration: 'none', fontWeight: 700,
        }}>
          Ver colección
          <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}