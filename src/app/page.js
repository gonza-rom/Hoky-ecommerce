'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';

const BANNERS = [
  {
    id: 1,
    eyebrow: 'Nueva colección',
    title: 'OTOÑO\n2026',
    sub: 'Prendas pensadas para la calle.\nCalidad que se nota.',
    cta: 'Ver colección',
    href: '/productos',
    bg: '#111',
    imgBg: '#d4cfc9',
  },
  {
    id: 2,
    eyebrow: 'Streetwear',
    title: 'URBAN\nWEAR',
    sub: 'Hoodies, baggys y remeras.\nEstilo que se vive.',
    cta: 'Ver catálogo',
    href: '/productos',
    bg: '#1a1a1a',
    imgBg: '#c8c3bc',
  },
  {
    id: 3,
    eyebrow: 'Exclusivo online',
    title: 'ENVÍOS\nGRATIS',
    sub: 'En compras superiores\na $50.000.',
    cta: 'Aprovechar',
    href: '/productos',
    bg: '#0f0f0f',
    imgBg: '#bbb5ae',
  },
];

export default function Home() {
  const [banner, setBanner] = useState(0);
  const [catActiva, setCatActiva] = useState('');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const t = setInterval(() => setBanner((b) => (b + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '8');
    if (catActiva) params.set('categoria', catActiva);
    else params.set('destacados', 'true');

    fetch(`/api/productos?${params}`)
      .then((r) => r.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, [catActiva]);

  const b = BANNERS[banner];

  const catsMenu = [
    { label: 'Todo', value: '' },
    ...categorias.slice(0, 5).map((c) => ({ label: c.nombre, value: c.id })),
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        /* ── Ticker ── */
        @keyframes hoky-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Skeleton ── */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }

        /* ── Hero ── */
        .hk-hero {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 300px;
        }
        .hk-hero-img { display: none; }
        .hk-hero-text { padding: 36px 20px; }
        .hk-hero-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 58px;
          line-height: 0.88;
          letter-spacing: 0.02em;
          margin: 0 0 14px;
          white-space: pre-line;
        }

        @media (min-width: 768px) {
          .hk-hero { grid-template-columns: 1fr 1fr; min-height: 380px; }
          .hk-hero-img { display: flex; }
          .hk-hero-text { padding: 44px 36px; }
          .hk-hero-h1 { font-size: 72px; }
        }

        /* ── Sección header ── */
        .hk-sec-header {
          padding: 28px 16px 0;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }
        @media (min-width: 768px) {
          .hk-sec-header { padding: 32px 28px 0; }
        }

        /* ── Filtro categorías ── */
        .hk-cats {
          display: flex;
          gap: 8px;
          padding: 14px 16px 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .hk-cats::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .hk-cats { padding: 18px 28px 0; }
        }

        /* ── Grid de productos ── */
        .hk-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px;
        }
        @media (min-width: 480px) {
          .hk-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 16px 20px;
          }
        }
        @media (min-width: 768px) {
          .hk-grid {
            grid-template-columns: repeat(4, 1fr);
            padding: 20px 28px;
          }
        }
        @media (min-width: 1280px) {
          .hk-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }

        /* ── Strip CTA ── */
        .hk-strip {
          background: #111;
          color: #fff;
          padding: 28px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
        }
        .hk-strip-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 30px;
          letter-spacing: 0.04em;
          margin: 0;
        }
        @media (min-width: 768px) {
          .hk-strip {
            padding: 36px 28px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 0;
          }
          .hk-strip-title { font-size: 42px; }
        }
      `}</style>

      {/* ── Ticker ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#111', color: '#fff', overflow: 'hidden', padding: '9px 0' }}>
        <div style={{ display: 'flex', animation: 'hoky-scroll 22s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0 48px' }}>
              ENVÍOS A TODO EL PAÍS &nbsp;·&nbsp; 3 CUOTAS SIN INTERÉS &nbsp;·&nbsp; NUEVA COLECCIÓN OTOÑO 2026
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero carrusel ──────────────────────────────────────────────────── */}
      <div className="hk-hero" style={{ background: b.bg, transition: 'background 0.5s ease' }}>

        {/* Texto */}
        <div
          className="hk-hero-text"
          style={{ color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.5, margin: '0 0 10px' }}>
            {b.eyebrow}
          </p>
          <h1 className="hk-hero-h1">{b.title}</h1>
          <p style={{ fontSize: 13, opacity: 0.5, margin: '0 0 24px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {b.sub}
          </p>
          <Link href={b.href} style={{
            display: 'inline-block', background: '#fff', color: '#111',
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '11px 24px', fontWeight: 700, width: 'fit-content', textDecoration: 'none',
          }}>
            {b.cta}
          </Link>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBanner(i)}
                style={{
                  width: i === banner ? 20 : 6, height: 6,
                  background: i === banner ? '#fff' : 'rgba(255,255,255,0.3)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Imagen — solo desktop */}
        <div
          className="hk-hero-img"
          style={{
            background: b.imgBg,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.5s ease',
          }}
        >
          {/* Watermark text */}
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 90,
              opacity: 0.12,
              color: '#555',
              userSelect: 'none',
            }}
          >
            HOKY
          </span>

          {/* Hero image */}
          <Image
            src="/hoky.jpg"
            alt="Hoky hero"
            fill
            style={{ objectFit: 'cover' }}
          />

          {/* Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 18,
              right: 18,
              background: 'rgba(255,255,255,0.92)',
              padding: '9px 16px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#111',
                fontWeight: 700,
              }}
            >
              Nueva temporada
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
              Otoño · Invierno
            </div>
          </div>
        </div>
      </div>

      {/* ── Destacados ─────────────────────────────────────────────────────── */}
      <div className="hk-sec-header">
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: '0.04em', margin: 0 }}>
          DESTACADOS
        </h2>
        <Link href="/productos" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', textDecoration: 'none' }}>
          Ver todos →
        </Link>
      </div>

      {/* ── Filtro categorías ───────────────────────────────────────────────── */}
      <div className="hk-cats">
        {catsMenu.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCatActiva(cat.value)}
            style={{
              background: catActiva === cat.value ? '#111' : 'transparent',
              color: catActiva === cat.value ? '#fff' : '#888',
              border: `0.5px solid ${catActiva === cat.value ? '#111' : '#ddd'}`,
              padding: '7px 16px', fontSize: 11, letterSpacing: '0.12em',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
              cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="hk-grid">
        {loading
          ? [...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#f0ede8', aspectRatio: '3/4', animation: 'pulse 1.5s infinite' }} />
            ))
          : productos.map((p) => (
              <ProductCard key={p.id} producto={p} onAddToCart={addToCart} />
            ))
        }
        {!loading && productos.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              No hay productos disponibles
            </p>
          </div>
        )}
      </div>

      {/* ── Strip CTA ──────────────────────────────────────────────────────── */}
      <div className="hk-strip">
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 6px' }}>
            Colección completa
          </p>
          <p className="hk-strip-title">TODO EL CATÁLOGO</p>
        </div>
        <Link href="/productos" style={{
          background: '#fff', color: '#111', fontSize: 11,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '11px 24px', fontWeight: 700, textDecoration: 'none', width: 'fit-content',
        }}>
          Explorar ahora
        </Link>
      </div>

    </div>
  );
}