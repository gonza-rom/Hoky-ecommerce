'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag, Search, Filter, X, SlidersHorizontal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 12;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Slider de precio ─────────────────────────────────────────────────────────
function PriceRange({ min, max, value, onChange }) {
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  const fmt = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const handleMin = (e) => {
    const v = Math.min(parseInt(e.target.value), local[1] - 1000);
    setLocal([v, local[1]]);
  };
  const handleMax = (e) => {
    const v = Math.max(parseInt(e.target.value), local[0] + 1000);
    setLocal([local[0], v]);
  };
  const commit = () => onChange(local);

  const pctMin = ((local[0] - min) / (max - min)) * 100;
  const pctMax = ((local[1] - min) / (max - min)) * 100;

  return (
    <div>
      {/* Valores */}
      <div className="flex justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">{fmt(local[0])}</span>
        <span className="text-xs font-semibold text-gray-700">{fmt(local[1])}</span>
      </div>

      {/* Track doble */}
      <div className="relative h-1.5 rounded-full bg-gray-200 mb-4">
        <div className="absolute h-full rounded-full bg-[#111]"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }} />
        <input type="range" min={min} max={max} step={1000}
          value={local[0]} onChange={handleMin} onMouseUp={commit} onTouchEnd={commit}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 3 }} />
        <input type="range" min={min} max={max} step={1000}
          value={local[1]} onChange={handleMax} onMouseUp={commit} onTouchEnd={commit}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
        {/* Thumbs */}
        <div className="absolute w-4 h-4 bg-[#111] rounded-full -mt-1.5 -ml-2 border-2 border-white shadow"
          style={{ left: `${pctMin}%`, top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none' }} />
        <div className="absolute w-4 h-4 bg-[#111] rounded-full -mt-1.5 -ml-2 border-2 border-white shadow"
          style={{ left: `${pctMax}%`, top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

// ── Sección colapsable del sidebar ───────────────────────────────────────────
function FilterSection({ titulo, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 text-left">
        <span className="text-sm font-semibold text-gray-700">{titulo}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

// ── Paginación ────────────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, pageSize } = pagination;
  const desde = (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  const getPages = () => {
    const delta = 2, range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    return range;
  };

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-semibold text-gray-800">{desde}–{hasta}</span> de{' '}
        <span className="font-semibold text-gray-800">{total}</span> productos
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page === 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages()[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-9 h-9 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">1</button>
            {getPages()[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {getPages().map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-[#111] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
            {p}
          </button>
        ))}
        {getPages()[getPages().length - 1] < totalPages && (
          <>
            {getPages()[getPages().length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-9 h-9 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">{totalPages}</button>
          </>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Contenido principal ───────────────────────────────────────────────────────
function ProductosContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Opciones disponibles
  const [tallesDisp,  setTallesDisp]  = useState([]);
  const [coloresDisp, setColoresDisp] = useState([]);
  const [rangoPrecios, setRangoPrecios] = useState({ min: 0, max: 200000 });

  // Filtros activos
  const [busquedaInput,         setBusquedaInput]         = useState(searchParams.get('busqueda') || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(searchParams.get('categoria') || '');
  const [ordenar,               setOrdenar]               = useState('');
  const [tallesActivos,         setTallesActivos]         = useState([]);
  const [coloresActivos,        setColoresActivos]        = useState([]);
  const [precioRange,           setPrecioRange]           = useState([0, 200000]);
  const [page,                  setPage]                  = useState(1);

  const busqueda = useDebounce(busquedaInput, 400);
  const { addToCart } = useCart();
  const topRef = useRef(null);

  // Cargar opciones de filtros y rango de precios
  useEffect(() => {
    fetch('/api/productos?opciones=true')
      .then(r => r.json())
      .then(({ talles, colores }) => {
        setTallesDisp(talles ?? []);
        setColoresDisp(colores ?? []);
      }).catch(() => {});

    fetch('/api/productos?rangoPrecios=true')
      .then(r => r.json())
      .then(({ min, max }) => {
        const rMin = min ?? 0;
        const rMax = max ?? 200000;
        setRangoPrecios({ min: rMin, max: rMax });
        setPrecioRange([rMin, rMax]);
      }).catch(() => {});
  }, []);

  // Fetch categorías
  useEffect(() => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Fetch productos
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page',     String(page));
      params.set('pageSize', String(PAGE_SIZE));
      if (busqueda)              params.set('busqueda',  busqueda);
      if (categoriaSeleccionada) params.set('categoria', categoriaSeleccionada);
      if (ordenar)               params.set('ordenar',   ordenar);
      if (tallesActivos.length)  params.set('talles',    tallesActivos.join(','));
      if (coloresActivos.length) params.set('colores',   coloresActivos.join(','));
      if (precioRange[0] > rangoPrecios.min) params.set('precioMin', String(precioRange[0]));
      if (precioRange[1] < rangoPrecios.max) params.set('precioMax', String(precioRange[1]));

      const response = await fetch(`/api/productos?${params.toString()}`);
      const data     = await response.json();

      if (data.productos) {
        setProductos(data.productos);
        setPagination(data.pagination);
      } else {
        setProductos(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, categoriaSeleccionada, ordenar, tallesActivos, coloresActivos, precioRange, rangoPrecios]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  useEffect(() => { setPage(1); }, [busqueda, categoriaSeleccionada, ordenar, tallesActivos, coloresActivos, precioRange]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleTalle = (t) =>
    setTallesActivos(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const toggleColor = (c) =>
    setColoresActivos(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const limpiarFiltros = () => {
    setBusquedaInput('');
    setCategoriaSeleccionada('');
    setOrdenar('');
    setTallesActivos([]);
    setColoresActivos([]);
    setPrecioRange([rangoPrecios.min, rangoPrecios.max]);
    setPage(1);
    router.push('/productos');
  };

  const hayFiltrosActivos = busquedaInput || categoriaSeleccionada || ordenar
    || tallesActivos.length || coloresActivos.length
    || precioRange[0] > rangoPrecios.min || precioRange[1] < rangoPrecios.max;

  const cantFiltros = [
    categoriaSeleccionada ? 1 : 0,
    ordenar ? 1 : 0,
    tallesActivos.length,
    coloresActivos.length,
    (precioRange[0] > rangoPrecios.min || precioRange[1] < rangoPrecios.max) ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ── Sidebar compartido ────────────────────────────────────
  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-base flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filtros
        </h2>
        {hayFiltrosActivos && (
          <button onClick={limpiarFiltros} className="text-xs font-semibold text-gray-500 hover:text-black underline">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <FilterSection titulo="Buscar">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Buscar..." value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400" />
          {busquedaInput && (
            <button onClick={() => setBusquedaInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </FilterSection>

      {/* Categorías */}
      <FilterSection titulo="Categoría">
        <div className="space-y-0.5">
          <button onClick={() => setCategoriaSeleccionada('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoriaSeleccionada ? 'bg-[#111] text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
            <div className="flex justify-between">
              <span>Todas</span>
              <span className="text-xs opacity-60">({pagination?.total ?? '…'})</span>
            </div>
          </button>
          {categorias.map((cat) => (
            <div key={cat.id}>
              {/* Categoría raíz */}
              <button onClick={() => setCategoriaSeleccionada(cat.id.toString())}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium ${categoriaSeleccionada === cat.id.toString() ? 'bg-[#111] text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                <div className="flex justify-between items-center">
                  <span>{cat.nombre}</span>
                  <span className="text-xs opacity-60">({cat._count?.productos ?? 0})</span>
                </div>
              </button>
              {/* Subcategorías */}
              {cat.hijos?.length > 0 && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                  {cat.hijos.map(hijo => (
                    <button key={hijo.id} onClick={() => setCategoriaSeleccionada(hijo.id.toString())}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${categoriaSeleccionada === hijo.id.toString() ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                      <div className="flex justify-between items-center">
                        <span>{hijo.nombre}</span>
                        <span className="opacity-60">({hijo._count?.productos ?? 0})</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Talles */}
      {tallesDisp.length > 0 && (
        <FilterSection titulo="Talle">
          <div className="flex flex-wrap gap-1.5">
            {tallesDisp.map(t => (
              <button key={t} onClick={() => toggleTalle(t)}
                className={`px-3 py-1.5 text-xs font-bold border rounded transition-all ${
                  tallesActivos.includes(t)
                    ? 'bg-[#111] text-white border-[#111]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colores */}
      {coloresDisp.length > 0 && (
        <FilterSection titulo="Color">
          <div className="flex flex-wrap gap-2">
            {coloresDisp.map(c => {
              const activo = coloresActivos.includes(c);
              return (
                <button key={c} onClick={() => toggleColor(c)} title={c}
                  className={`px-3 py-1.5 text-xs font-semibold border rounded-full transition-all capitalize ${
                    activo
                      ? 'bg-[#111] text-white border-[#111]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                  {c}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Precio */}
      <FilterSection titulo="Precio">
        <PriceRange
          min={rangoPrecios.min}
          max={rangoPrecios.max}
          value={precioRange}
          onChange={setPrecioRange}
        />
      </FilterSection>

      {/* Ordenar */}
      <FilterSection titulo="Ordenar por" defaultOpen={false}>
        <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white">
          <option value="">Más recientes</option>
          <option value="nombre">Nombre A-Z</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
        </select>
      </FilterSection>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <SidebarContent />
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1" ref={topRef}>

          {/* Barra superior móvil */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Buscar productos..." value={busquedaInput}
                  onChange={(e) => setBusquedaInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-sm" />
                {busquedaInput && (
                  <button onClick={() => setBusquedaInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón filtros móvil */}
              <button onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="lg:hidden relative bg-[#111] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold flex-shrink-0">
                <Filter className="w-4 h-4" />
                Filtros
                {cantFiltros > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                    {cantFiltros}
                  </span>
                )}
              </button>

              {/* Ordenar desktop */}
              <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)}
                className="hidden md:block px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white min-w-[180px]">
                <option value="">Más recientes</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* Drawer filtros móvil */}
          {mostrarFiltros && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMostrarFiltros(false)} />
              <div className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-base">Filtros</h2>
                  <button onClick={() => setMostrarFiltros(false)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <SidebarContent />
                <button onClick={() => setMostrarFiltros(false)}
                  className="mt-4 w-full bg-[#111] text-white py-3 rounded-lg font-semibold text-sm">
                  Ver {pagination?.total ?? ''} productos
                </button>
              </div>
            </div>
          )}

          {/* Tags filtros activos */}
          {hayFiltrosActivos && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {busqueda && (
                <Tag label={`"${busqueda}"`} onRemove={() => setBusquedaInput('')} />
              )}
              {categoriaSeleccionada && (
                <Tag
                  label={categorias.find(c => c.id.toString() === categoriaSeleccionada)?.nombre ?? 'Categoría'}
                  onRemove={() => setCategoriaSeleccionada('')}
                />
              )}
              {tallesActivos.map(t => (
                <Tag key={t} label={`T: ${t}`} onRemove={() => toggleTalle(t)} />
              ))}
              {coloresActivos.map(c => (
                <Tag key={c} label={c} onRemove={() => toggleColor(c)} />
              ))}
              {(precioRange[0] > rangoPrecios.min || precioRange[1] < rangoPrecios.max) && (
                <Tag
                  label={`Precio: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precioRange[0])} – ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precioRange[1])}`}
                  onRemove={() => setPrecioRange([rangoPrecios.min, rangoPrecios.max])}
                />
              )}
            </div>
          )}

          {/* Contador */}
          {!loading && pagination && (
            <p className="mb-4 text-sm text-gray-500">
              {pagination.total === 0
                ? 'No se encontraron productos'
                : <><span className="font-semibold text-gray-900">{pagination.total}</span> productos encontrados</>
              }
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl animate-pulse">
                  <div className="aspect-[3/4] w-full" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
              <p className="text-gray-400 mb-6 text-sm">Probá con otros filtros</p>
              <button onClick={limpiarFiltros}
                className="bg-[#111] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productos.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} onAddToCart={addToCart} />
                ))}
              </div>
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tag de filtro activo ──────────────────────────────────────────────────────
function Tag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-black transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Nuestros Productos</h1>
          <p className="text-gray-500 text-sm">Explorá el catálogo completo de Hoky Indumentaria</p>
        </div>
      </div>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        </div>
      }>
        <ProductosContent />
      </Suspense>
    </div>
  );
}