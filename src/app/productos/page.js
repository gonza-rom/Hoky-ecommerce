'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 12;

// ── Hook: debounce para la búsqueda ──────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Componente de paginación ─────────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, pageSize } = pagination;
  const desde = (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  // Generar páginas visibles (max 5 botones)
  const getPages = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) range.push(i);
    return range;
  };

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-semibold text-gray-800">{desde}–{hasta}</span> de{' '}
        <span className="font-semibold text-gray-800">{total}</span> productos
      </p>

      <div className="flex items-center gap-1">
        {/* Primera página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Página anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Ellipsis inicio */}
        {getPages()[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >1</button>
            {getPages()[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {/* Páginas numeradas */}
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              p === page
                ? 'bg-jmr-green text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}

        {/* Ellipsis fin */}
        {getPages()[getPages().length - 1] < totalPages && (
          <>
            {getPages()[getPages().length - 1] < totalPages - 1 && (
              <span className="px-1 text-gray-400">…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >{totalPages}</button>
          </>
        )}

        {/* Página siguiente */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Última página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Contenido principal ──────────────────────────────────────────────────────
function ProductosContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros locales (con debounce en busqueda)
  const [busquedaInput,      setBusquedaInput]      = useState(searchParams.get('busqueda') || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(searchParams.get('categoria') || '');
  const [ordenar,            setOrdenar]            = useState('');
  const [page,               setPage]               = useState(1);

  const busqueda = useDebounce(busquedaInput, 400);
  const { addToCart } = useCart();

  // Referencia para scroll al cambiar página
  const topRef = useRef(null);

  // ── Fetch de categorías (una sola vez) ──────────────────────────────────
  useEffect(() => {
    fetch('/api/categorias')
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // ── Fetch de productos (se dispara cuando cambian los filtros o la página) ─
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page',     String(page));
      params.set('pageSize', String(PAGE_SIZE));
      if (busqueda)             params.set('busqueda',  busqueda);
      if (categoriaSeleccionada) params.set('categoria', categoriaSeleccionada);
      if (ordenar)              params.set('ordenar',   ordenar);

      const response = await fetch(`/api/productos?${params.toString()}`);
      const data     = await response.json();

      if (data.productos) {
        setProductos(data.productos);
        setPagination(data.pagination);
      } else {
        // Fallback para compatibilidad (si la API devuelve array directo)
        setProductos(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, categoriaSeleccionada, ordenar]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Volver a página 1 cuando cambia cualquier filtro
  useEffect(() => {
    setPage(1);
  }, [busqueda, categoriaSeleccionada, ordenar]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll suave al inicio de la lista
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const limpiarFiltros = () => {
    setBusquedaInput('');
    setCategoriaSeleccionada('');
    setOrdenar('');
    setPage(1);
    router.push('/productos');
  };

  const hayFiltrosActivos = busquedaInput || categoriaSeleccionada || ordenar;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </h2>
              {hayFiltrosActivos && (
                <button onClick={limpiarFiltros} className="text-sm text-jmr-green hover:underline">
                  Limpiar
                </button>
              )}
            </div>

            {/* Búsqueda */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busquedaInput}
                  onChange={(e) => setBusquedaInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green text-sm"
                />
                {busquedaInput && (
                  <button
                    onClick={() => setBusquedaInput('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Categorías */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Categorías</label>
              <div className="space-y-1">
                <button
                  onClick={() => setCategoriaSeleccionada('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !categoriaSeleccionada ? 'bg-jmr-green text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Todas</span>
                    <span className="text-xs opacity-75">({pagination?.total ?? '…'})</span>
                  </div>
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSeleccionada(cat.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      categoriaSeleccionada === cat.id.toString()
                        ? 'bg-jmr-green text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.nombre}</span>
                      <span className="text-xs opacity-75">({cat._count?.productos ?? 0})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar por</label>
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white text-sm"
              >
                <option value="">Más recientes</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="flex-1" ref={topRef}>

          {/* Barra superior */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busquedaInput}
                  onChange={(e) => setBusquedaInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green"
                />
                {busquedaInput && (
                  <button
                    onClick={() => setBusquedaInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Botón filtros móvil */}
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="lg:hidden bg-jmr-green text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Filter className="w-5 h-5" />
                Filtros
                {(categoriaSeleccionada || ordenar) && (
                  <span className="bg-white text-jmr-green rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {(categoriaSeleccionada ? 1 : 0) + (ordenar ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Ordenar desktop */}
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="hidden md:block px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white min-w-[200px]"
              >
                <option value="">Más recientes</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
              </select>
            </div>

            {/* Filtros móvil expandidos */}
            {mostrarFiltros && (
              <div className="lg:hidden mt-4 space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                  <select
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar por</label>
                  <select
                    value={ordenar}
                    onChange={(e) => setOrdenar(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
                  >
                    <option value="">Más recientes</option>
                    <option value="nombre">Nombre A-Z</option>
                    <option value="precio-asc">Menor precio</option>
                    <option value="precio-desc">Mayor precio</option>
                  </select>
                </div>
                {hayFiltrosActivos && (
                  <button
                    onClick={limpiarFiltros}
                    className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"
                  >
                    <X className="w-5 h-5" />
                    Limpiar Filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tags de filtros activos */}
          {(busqueda || categoriaSeleccionada) && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {busqueda && (
                <span className="inline-flex items-center gap-2 bg-jmr-green/10 text-jmr-green px-3 py-1 rounded-full text-sm">
                  Búsqueda: "{busqueda}"
                  <button onClick={() => setBusquedaInput('')} className="hover:bg-jmr-green/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoriaSeleccionada && (
                <span className="inline-flex items-center gap-2 bg-jmr-green/10 text-jmr-green px-3 py-1 rounded-full text-sm">
                  {categorias.find(c => c.id === parseInt(categoriaSeleccionada))?.nombre || 'Categoría'}
                  <button onClick={() => setCategoriaSeleccionada('')} className="hover:bg-jmr-green/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Contador */}
          {!loading && pagination && (
            <p className="mb-4 text-sm text-gray-600">
              {pagination.total === 0
                ? 'No se encontraron productos'
                : <>
                    <span className="font-semibold text-gray-900">{pagination.total}</span>{' '}
                    {pagination.total === 1 ? 'producto' : 'productos'} encontrados
                  </>
              }
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500 mb-6">Intenta con otros filtros o búsqueda</p>
              <button
                onClick={limpiarFiltros}
                className="bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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

// ── Página principal con Suspense ────────────────────────────────────────────
export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Nuestros Productos</h1>
          <p className="text-gray-600">Explora nuestro catálogo completo de marroquinería</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <ProductosContent />
      </Suspense>
    </div>
  );
}