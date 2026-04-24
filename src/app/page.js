'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
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
    sub: 'En compras superiores\na $50.000.',
    cta: 'Aprovechar', href: '/productos', bg: '#0f0f0f', imgBg: '#bbb5ae',
  },
];

const PAGE_SIZE = 12;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function FilterSection({ titulo, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f0ede8', paddingBottom: 12, marginBottom: 12 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        marginBottom: open ? 10 : 0, padding: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>{titulo}</span>
        {open ? <ChevronUp size={13} color="#aaa" /> : <ChevronDown size={13} color="#aaa" />}
      </button>
      {open && children}
    </div>
  );
}

export default function Home() {
  const [banner,         setBanner]         = useState(0);
  const [catActiva,      setCatActiva]       = useState('');
  const [productos,      setProductos]       = useState([]);
  const [categorias,     setCategorias]      = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [loadingMas,     setLoadingMas]      = useState(false);
  const [pagina,         setPagina]          = useState(1);
  const [hayMas,         setHayMas]          = useState(true);
  const [mostrarFiltros, setMostrarFiltros]  = useState(false);

  // Filtros
  const [tallesDisp,     setTallesDisp]     = useState([]);
  const [coloresDisp,    setColoresDisp]    = useState([]);
  const [tallesActivos,  setTallesActivos]  = useState([]);
  const [coloresActivos, setColoresActivos] = useState([]);
  const [ordenar,        setOrdenar]        = useState('');
  const [rangoPrecios,   setRangoPrecios]   = useState({ min: 0, max: 200000 });
  const [precioRange,    setPrecioRange]    = useState([0, 200000]);
  const [busquedaInput,  setBusquedaInput]  = useState('');
  const busqueda = useDebounce(busquedaInput, 400);

  const { addToCart } = useCart();

  useEffect(() => {
    const t = setInterval(() => setBanner((b) => (b + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/productos?opciones=true')
      .then(r => r.json())
      .then(({ talles, colores }) => { setTallesDisp(talles ?? []); setColoresDisp(colores ?? []); })
      .catch(() => {});

    fetch('/api/productos?rangoPrecios=true')
      .then(r => r.json())
      .then(({ min, max }) => {
        const rMin = min ?? 0, rMax = max ?? 200000;
        setRangoPrecios({ min: rMin, max: rMax });
        setPrecioRange([rMin, rMax]);
      }).catch(() => {});
  }, []);

  const buildParams = useCallback((page) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));
    if (catActiva)             params.set('categoria', catActiva);
    if (busqueda)              params.set('busqueda',  busqueda);
    if (ordenar)               params.set('ordenar',   ordenar);
    if (tallesActivos.length)  params.set('talles',    tallesActivos.join(','));
    if (coloresActivos.length) params.set('colores',   coloresActivos.join(','));
    if (precioRange[0] > rangoPrecios.min) params.set('precioMin', String(precioRange[0]));
    if (precioRange[1] < rangoPrecios.max) params.set('precioMax', String(precioRange[1]));
    return params;
  }, [catActiva, busqueda, ordenar, tallesActivos, coloresActivos, precioRange, rangoPrecios]);

  useEffect(() => {
    setLoading(true); setPagina(1); setHayMas(true);
    fetch(`/api/productos?${buildParams(1)}`)
      .then(r => r.json())
      .then(data => {
        const lista = data?.productos ?? (Array.isArray(data) ? data : []);
        setProductos(lista);
        setHayMas(data?.pagination?.hasNext ?? lista.length >= PAGE_SIZE);
      })
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, [catActiva, busqueda, ordenar, tallesActivos, coloresActivos, precioRange]);

  const cargarMas = useCallback(() => {
    if (loadingMas || !hayMas) return;
    setLoadingMas(true);
    const nuevaPagina = pagina + 1;
    fetch(`/api/productos?${buildParams(nuevaPagina)}`)
      .then(r => r.json())
      .then(data => {
        const lista = data?.productos ?? (Array.isArray(data) ? data : []);
        setProductos(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...lista.filter(p => !ids.has(p.id))];
        });
        setPagina(nuevaPagina);
        setHayMas(data?.pagination?.hasNext ?? lista.length >= PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoadingMas(false));
  }, [pagina, buildParams, loadingMas, hayMas]);

  const limpiarFiltros = () => {
    setCatActiva(''); setBusquedaInput(''); setOrdenar('');
    setTallesActivos([]); setColoresActivos([]);
    setPrecioRange([rangoPrecios.min, rangoPrecios.max]);
  };

  const hayFiltros = !!(catActiva || busquedaInput || ordenar || tallesActivos.length || coloresActivos.length
    || precioRange[0] > rangoPrecios.min || precioRange[1] < rangoPrecios.max);

  const toggleTalle = (t) => setTallesActivos(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleColor = (c) => setColoresActivos(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const fmtP = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const b = BANNERS[banner];

  const catsMenu = [
    { label: 'Todo', value: '' },
    ...categorias.map(c => ({ label: c.nombre, value: c.id })),
  ];

  function DrawerFiltros() {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarFiltros(false)} />
        <div style={{ position: 'relative', marginLeft: 'auto', width: 300, maxWidth: '90vw', background: '#fff', height: '100%', overflowY: 'auto', padding: 20, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Filtros</span>
            <button onClick={() => setMostrarFiltros(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#aaa" />
            </button>
          </div>

          {hayFiltros && (
            <button onClick={limpiarFiltros} style={{ width: '100%', marginBottom: 12, padding: '7px', border: '1px solid #e0dbd5', borderRadius: 8, background: 'transparent', fontSize: 11, cursor: 'pointer', color: '#888' }}>
              Limpiar filtros
            </button>
          )}

          <FilterSection titulo="Buscar">
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
              <input value={busquedaInput} onChange={e => setBusquedaInput(e.target.value)} placeholder="Buscar productos..."
                style={{ width: '100%', padding: '8px 8px 8px 26px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </FilterSection>

          <FilterSection titulo="Categoría">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {catsMenu.map(cat => (
                <button key={cat.value} onClick={() => { setCatActiva(cat.value); }} style={{
                  padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12,
                  background: catActiva === cat.value ? '#111' : 'transparent',
                  color: catActiva === cat.value ? '#fff' : '#555', fontWeight: catActiva === cat.value ? 700 : 400,
                }}>{cat.label}</button>
              ))}
            </div>
          </FilterSection>

          {tallesDisp.length > 0 && (
            <FilterSection titulo="Talle">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tallesDisp.map(t => (
                  <button key={t} onClick={() => toggleTalle(t)} style={{
                    padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer',
                    border: tallesActivos.includes(t) ? '2px solid #111' : '1px solid #e0dbd5',
                    background: tallesActivos.includes(t) ? '#111' : '#fff',
                    color: tallesActivos.includes(t) ? '#fff' : '#555',
                  }}>{t}</button>
                ))}
              </div>
            </FilterSection>
          )}

          {coloresDisp.length > 0 && (
            <FilterSection titulo="Color">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {coloresDisp.map(c => (
                  <button key={c} onClick={() => toggleColor(c)} style={{
                    padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 20, cursor: 'pointer', textTransform: 'capitalize',
                    border: coloresActivos.includes(c) ? '2px solid #111' : '1px solid #e0dbd5',
                    background: coloresActivos.includes(c) ? '#111' : '#fff',
                    color: coloresActivos.includes(c) ? '#fff' : '#555',
                  }}>{c}</button>
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection titulo="Precio">
            <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#555' }}>
              <span>{fmtP(precioRange[0])}</span><span>{fmtP(precioRange[1])}</span>
            </div>
            <input type="range" min={rangoPrecios.min} max={rangoPrecios.max} step={1000}
              value={precioRange[1]} onChange={e => setPrecioRange([precioRange[0], parseInt(e.target.value)])}
              style={{ width: '100%', accentColor: '#111' }} />
          </FilterSection>

          <FilterSection titulo="Ordenar" defaultOpen={false}>
            <select value={ordenar} onChange={e => setOrdenar(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff', color: '#111' }}>
              <option value="">Más recientes</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </select>
          </FilterSection>

          <button onClick={() => setMostrarFiltros(false)} style={{ width: '100%', marginTop: 16, padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Ver productos
          </button>
        </div>
      </div>
    );
  }

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
        .hk-sec-header { padding: 28px 16px 0; display: flex; align-items: center; justify-content: space-between; }
        @media (min-width: 768px) { .hk-sec-header { padding: 32px 28px 0; } }
        .hk-cats { display: flex; gap: 8px; padding: 14px 16px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .hk-cats::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) { .hk-cats { padding: 18px 28px 0; } }
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

      {/* Header productos */}
      <div className="hk-sec-header">
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: '0.04em', margin: 0 }}>PRODUCTOS</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hayFiltros && (
            <button onClick={limpiarFiltros} style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Limpiar
            </button>
          )}
          <button onClick={() => setMostrarFiltros(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            border: `1px solid ${hayFiltros ? '#111' : '#e0dbd5'}`,
            borderRadius: 8, background: hayFiltros ? '#111' : '#fff',
            color: hayFiltros ? '#fff' : '#555', fontSize: 11, cursor: 'pointer', fontWeight: 600,
          }}>
            <SlidersHorizontal size={13} /> Filtros{hayFiltros ? ' ●' : ''}
          </button>
          <Link href="/productos" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>
      </div>

      {/* Filtro categorías (pill bar — diseño original) */}
      <div className="hk-cats">
        {catsMenu.map(cat => (
          <button key={cat.value} onClick={() => setCatActiva(cat.value)} style={{
            background: catActiva === cat.value ? '#111' : 'transparent',
            color: catActiva === cat.value ? '#fff' : '#888',
            border: `0.5px solid ${catActiva === cat.value ? '#111' : '#ddd'}`,
            padding: '7px 16px', fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="hk-grid">
        {loading
          ? [...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} style={{ background: '#f0ede8', aspectRatio: '3/4', animation: 'pulse 1.5s infinite' }} />
            ))
          : productos.map(p => <ProductCard key={p.id} producto={p} onAddToCart={addToCart} />)
        }
        {!loading && productos.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No hay productos disponibles</p>
          </div>
        )}
      </div>

      {/* Cargar más */}
      {!loading && hayMas && productos.length > 0 && (
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

      {!loading && !hayMas && productos.length > 0 && (
        <div style={{ textAlign: 'center', padding: '8px 16px 32px', color: '#aaa', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          — Todos los productos —
        </div>
      )}

      {/* Strip CTA */}
      <div className="hk-strip">
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, margin: '0 0 6px' }}>Colección completa</p>
          <p className="hk-strip-title">TODO EL CATÁLOGO</p>
        </div>
        <Link href="/productos" style={{ background: '#fff', color: '#111', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '11px 24px', fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}>
          Explorar ahora
        </Link>
      </div>

      {/* Drawer filtros */}
      {mostrarFiltros && <DrawerFiltros />}
    </div>
  );
}