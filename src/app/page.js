'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';

const BANNERS = [
  {
    id: 1, eyebrow: 'Nueva colección', title: 'OTOÑO\n2026',
    sub: 'Prendas pensadas para la calle.\nCalidad que se nota.',
    cta: 'Ver colección', href: '/productos', bg: '#111', imgBg: '#d4cfc9',
  },
  {
    id: 2, eyebrow: 'Streetwear', title: 'URBAN\nWEAR',
    sub: 'Hoodies, baggys y remeras.\nEstilo que se vive.',
    cta: 'Ver catálogo', href: '/productos', bg: '#1a1a1a', imgBg: '#c8c3bc',
  },
  {
    id: 3, eyebrow: 'Exclusivo online', title: 'ENVÍOS\nGRATIS',
    sub: 'En compras superiores\na $150.000.',
    cta: 'Aprovechar', href: '/productos', bg: '#0f0f0f', imgBg: '#bbb5ae',
  },
];

// Cantidad de productos destacados a mostrar en el inicio
const DESTACADOS_SIZE = 8;

export default function Home() {
  const [banner, setBanner] = useState(0);
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMas, setLoadingMas] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [usarFallback, setUsarFallback] = useState(false); // true si no hay productos marcados como destacados

  const { addToCart } = useCart();

  useEffect(() => {
    const t = setInterval(() => setBanner((b) => (b + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const fetchDestacados = (page, esFallback) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(DESTACADOS_SIZE));
    if (!esFallback) params.set('destacados', 'true');
    return fetch(`/api/productos?${params}`).then(r => r.json());
  };

  useEffect(() => {
    setLoading(true); setPagina(1);
    fetchDestacados(1, false)
      .then(data => {
        const lista = data?.productos ?? (Array.isArray(data) ? data : []);
        if (lista.length > 0) {
          setDestacados(lista);
          setHayMas(data?.pagination?.hasNext ?? lista.length >= DESTACADOS_SIZE);
          setUsarFallback(false);
          return;
        }
        // Fallback: si no hay productos marcados como destacados (o el backend
        // todavía no soporta el flag), muestra los más recientes con paginación normal
        setUsarFallback(true);
        return fetchDestacados(1, true).then(d => {
          const listaFallback = d?.productos ?? (Array.isArray(d) ? d : []);
          setDestacados(listaFallback);
          setHayMas(d?.pagination?.hasNext ?? listaFallback.length >= DESTACADOS_SIZE);
        });
      })
      .catch(() => setDestacados([]))
      .finally(() => setLoading(false));
  }, []);

  const cargarMas = () => {
    if (loadingMas || !hayMas) return;
    setLoadingMas(true);
    const nuevaPagina = pagina + 1;
    fetchDestacados(nuevaPagina, usarFallback)
      .then(data => {
        const lista = data?.productos ?? (Array.isArray(data) ? data : []);
        setDestacados(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...lista.filter(p => !ids.has(p.id))];
        });
        setPagina(nuevaPagina);
        setHayMas(data?.pagination?.hasNext ?? lista.length >= DESTACADOS_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoadingMas(false));
  };

  const b = BANNERS[banner];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes hoky-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hk-hero { display: grid; grid-template-columns: 1fr; min-height: 300px; }
        .hk-hero-img { display: none; }
        .hk-hero-text { padding: 36px 20px; }
        .hk-hero-h1 { font-family: 'Bebas Neue', sans-serif; font-size: 58px; line-height: 0.88; letter-spacing: 0.02em; margin: 0 0 14px; white-space: pre-line; }
        @media (min-width: 768px) {
          .hk-hero { grid-template-columns: 1fr 1fr; min-height: 380px; }
          .hk-hero-img { display: flex; }
          .hk-hero-text { padding: 44px 36px; }
          .hk-hero-h1 { font-size: 72px; }
        }
        .hk-sec-header { padding: 28px 16px 0; display: flex; align-items: flex-end; justify-content: space-between; }
        @media (min-width: 768px) { .hk-sec-header { padding: 32px 28px 0; } }
        .hk-sec-sub { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #aaa; margin: 4px 0 0; }
        .hk-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 16px; }
        @media (min-width: 480px) { .hk-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 20px; } }
        @media (min-width: 768px) { .hk-grid { grid-template-columns: repeat(4, 1fr); padding: 20px 28px; } }
        @media (min-width: 1280px) { .hk-grid { grid-template-columns: repeat(6, 1fr); } }
        .hk-strip { background: #111; color: #fff; padding: 28px 16px; display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
        .hk-strip-title { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 0.04em; margin: 0; }
        @media (min-width: 768px) { .hk-strip { padding: 36px 28px; flex-direction: row; align-items: center; justify-content: space-between; gap: 0; } .hk-strip-title { font-size: 42px; } }
      `}</style>

      {/* Ticker */}
      <div style={{ background: '#111', color: '#fff', overflow: 'hidden', padding: '9px 0' }}>
        <div style={{ display: 'flex', animation: 'hoky-scroll 22s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0 48px' }}>
              ENVÍOS A TODO EL PAÍS &nbsp;·&nbsp; 3 CUOTAS SIN INTERÉS &nbsp;·&nbsp; NUEVA COLECCIÓN OTOÑO 2026
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="hk-hero" style={{ background: b.bg, transition: 'background 0.5s ease' }}>
        <div className="hk-hero-text" style={{ color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.5, margin: '0 0 10px' }}>{b.eyebrow}</p>
          <h1 className="hk-hero-h1">{b.title}</h1>
          <p style={{ fontSize: 13, opacity: 0.5, margin: '0 0 24px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{b.sub}</p>
          <Link href={b.href} style={{ display: 'inline-block', background: '#fff', color: '#111', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '11px 24px', fontWeight: 700, width: 'fit-content', textDecoration: 'none' }}>
            {b.cta}
          </Link>
          <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBanner(i)} style={{ width: i === banner ? 20 : 6, height: 6, background: i === banner ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
        <div className="hk-hero-img" style={{ background: b.imgBg, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'background 0.5s ease' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 90, opacity: 0.12, color: '#555', userSelect: 'none' }}>HOKY</span>
          <Image src="/hoky.jpg" alt="Hoky hero" fill style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 18, right: 18, background: 'rgba(255,255,255,0.92)', padding: '9px 16px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#111', fontWeight: 700 }}>Nueva temporada</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Otoño · Invierno</div>
          </div>
        </div>
      </div>

      {/* Header destacados */}
      <div className="hk-sec-header">
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: '0.04em', margin: 0 }}>DESTACADOS</h2>
          <p className="hk-sec-sub">{usarFallback ? 'Lo más nuevo de la temporada' : 'Una selección de la temporada'}</p>
        </div>
        <Link href="/productos" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', textDecoration: 'none' }}>
          Ver catálogo →
        </Link>
      </div>

      {/* Grid de destacados */}
      <div className="hk-grid">
        {loading
          ? [...Array(DESTACADOS_SIZE)].map((_, i) => (
              <div key={i} style={{ background: '#f0ede8', aspectRatio: '3/4', animation: 'pulse 1.5s infinite' }} />
            ))
          : destacados.map(p => <ProductCard key={p.id} producto={p} onAddToCart={addToCart} />)
        }
        {!loading && destacados.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No hay destacados por ahora</p>
            <Link href="/productos" style={{ display: 'inline-block', marginTop: 12, background: '#111', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700 }}>
              Ver catálogo
            </Link>
          </div>
        )}
      </div>

      {/* Cargar más destacados */}
      {!loading && hayMas && destacados.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 32px' }}>
          <button onClick={cargarMas} disabled={loadingMas} style={{
            background: loadingMas ? '#f0ede8' : '#111', color: loadingMas ? '#999' : '#fff',
            border: 'none', padding: '13px 40px', fontSize: 11, letterSpacing: '0.14em',
            textTransform: 'uppercase', fontWeight: 700, cursor: loadingMas ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', minWidth: 180, justifyContent: 'center',
          }}>
            {loadingMas ? <><span style={{ display: 'inline-flex', animation: 'spin 1s linear infinite' }}>⟳</span> Cargando...</> : 'Cargar más'}
          </button>
        </div>
      )}

      {/* Strip CTA — único punto de acceso al catálogo completo */}
      <div className="hk-strip">
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 6px' }}>Colección completa</p>
          <p className="hk-strip-title">TODO EL CATÁLOGO</p>
        </div>
        <Link href="/productos" style={{ background: '#fff', color: '#111', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '11px 24px', fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}>
          Explorar ahora
        </Link>
      </div>
    </div>
  );
}