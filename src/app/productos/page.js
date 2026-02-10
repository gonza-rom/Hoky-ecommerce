'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Filter, X, SlidersHorizontal, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState(searchParams.get('busqueda') || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(searchParams.get('categoria') || '');
  const [ordenar, setOrdenar] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [vistaGrid, setVistaGrid] = useState('grid'); // 'grid' o 'list'
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [productos, busqueda, categoriaSeleccionada, ordenar]);

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      setProductos(data);
      setProductosFiltrados(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...productos];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(busquedaLower) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower)) ||
        (p.codigoProducto && p.codigoProducto.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro por categoría
    if (categoriaSeleccionada) {
      resultado = resultado.filter(p => p.categoriaId === parseInt(categoriaSeleccionada));
    }

    // Ordenar
    if (ordenar === 'precio-asc') {
      resultado.sort((a, b) => a.precio - b.precio);
    } else if (ordenar === 'precio-desc') {
      resultado.sort((a, b) => b.precio - a.precio);
    } else if (ordenar === 'nombre') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (ordenar === 'recientes') {
      resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setProductosFiltrados(resultado);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada('');
    setOrdenar('');
    router.push('/productos');
  };

  const categoriasConConteo = categorias.map(cat => ({
    ...cat,
    count: productos.filter(p => p.categoriaId === cat.id).length
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h1>
          <p className="text-gray-600">
            Explora nuestro catálogo completo de marroquinería
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtros
                </h2>
                {(busqueda || categoriaSeleccionada || ordenar) && (
                  <button
                    onClick={limpiarFiltros}
                    className="text-sm text-jmr-green hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green text-sm"
                  />
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categorías
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategoriaSeleccionada('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !categoriaSeleccionada
                        ? 'bg-jmr-green text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Todas</span>
                      <span className="text-xs opacity-75">({productos.length})</span>
                    </div>
                  </button>
                  {categoriasConConteo.map((cat) => (
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
                        <span className="text-xs opacity-75">({cat.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white text-sm"
                >
                  <option value="">Más relevantes</option>
                  <option value="recientes">Más recientes</option>
                  <option value="nombre">Nombre A-Z</option>
                  <option value="precio-asc">Menor precio</option>
                  <option value="precio-desc">Mayor precio</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Barra de búsqueda y filtros móvil */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green"
                  />
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
                  <option value="">Más relevantes</option>
                  <option value="recientes">Más recientes</option>
                  <option value="nombre">Nombre A-Z</option>
                  <option value="precio-asc">Menor precio</option>
                  <option value="precio-desc">Mayor precio</option>
                </select>
              </div>

              {/* Filtros móvil expandible */}
              {mostrarFiltros && (
                <div className="lg:hidden mt-4 space-y-4 pt-4 border-t">
                  {/* Categorías móvil */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={categoriaSeleccionada}
                      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ordenar móvil */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={ordenar}
                      onChange={(e) => setOrdenar(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
                    >
                      <option value="">Más relevantes</option>
                      <option value="recientes">Más recientes</option>
                      <option value="nombre">Nombre A-Z</option>
                      <option value="precio-asc">Menor precio</option>
                      <option value="precio-desc">Mayor precio</option>
                    </select>
                  </div>

                  {(busqueda || categoriaSeleccionada || ordenar) && (
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

            {/* Contador y filtros activos */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <p className="text-gray-600">
                {productosFiltrados.length === 0 ? (
                  'No se encontraron productos'
                ) : (
                  <>
                    Mostrando <span className="font-semibold text-gray-900">{productosFiltrados.length}</span>{' '}
                    {productosFiltrados.length === 1 ? 'producto' : 'productos'}
                  </>
                )}
              </p>

              {/* Tags de filtros activos */}
              {(busqueda || categoriaSeleccionada) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {busqueda && (
                    <span className="inline-flex items-center gap-2 bg-jmr-green/10 text-jmr-green px-3 py-1 rounded-full text-sm">
                      Búsqueda: "{busqueda}"
                      <button
                        onClick={() => setBusqueda('')}
                        className="hover:bg-jmr-green/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {categoriaSeleccionada && (
                    <span className="inline-flex items-center gap-2 bg-jmr-green/10 text-jmr-green px-3 py-1 rounded-full text-sm">
                      {categorias.find(c => c.id === parseInt(categoriaSeleccionada))?.nombre}
                      <button
                        onClick={() => setCategoriaSeleccionada('')}
                        className="hover:bg-jmr-green/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Grid de productos */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-6">
                  Intenta con otros filtros o búsqueda
                </p>
                <button
                  onClick={limpiarFiltros}
                  className="bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productosFiltrados.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ producto, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      <Link href={`/productos/${producto.id}`} className="block">
        <div className="relative h-48 bg-gray-100">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Badge de stock */}
          {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
              ¡Últimas unidades!
            </div>
          )}
          
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                Sin Stock
              </span>
            </div>
          )}

          {/* Botón ver detalle - aparece en hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg">
              <Eye className="w-4 h-4" />
              Ver Detalles
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] hover:text-jmr-green transition-colors">
            {producto.nombre}
          </h3>
        </Link>
        
        {producto.categoria && (
          <Link 
            href={`/productos?categoria=${producto.categoriaId}`}
            className="text-xs text-gray-500 hover:text-jmr-green mb-2 inline-block"
          >
            {producto.categoria.nombre}
          </Link>
        )}
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mt-3">
            <p className="text-xl font-bold text-jmr-green">
              ${producto.precio.toFixed(2)}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(producto, 1);
              }}
              disabled={producto.stock === 0}
              className="bg-jmr-green hover:bg-jmr-green-dark text-white p-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              title={producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}