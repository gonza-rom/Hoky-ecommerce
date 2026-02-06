'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Search, Filter, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [ordenar, setOrdenar] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
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
    }

    setProductosFiltrados(resultado);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada('');
    setOrdenar('');
  };

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
        {/* Barra de búsqueda y filtros */}
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
              className="md:hidden bg-jmr-green text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>

            {/* Filtros desktop */}
            <div className="hidden md:flex gap-4">
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>

              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
              >
                <option value="">Ordenar por</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
              </select>

              {(busqueda || categoriaSeleccionada || ordenar) && (
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Filtros móvil expandible */}
          {mostrarFiltros && (
            <div className="md:hidden mt-4 space-y-4 pt-4 border-t">
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

              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jmr-green bg-white"
              >
                <option value="">Ordenar por</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
              </select>

              {(busqueda || categoriaSeleccionada || ordenar) && (
                <button
                  onClick={limpiarFiltros}
                  className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contador */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando <span className="font-semibold">{productosFiltrados.length}</span> productos
          </p>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta con otros filtros o búsqueda
            </p>
            <button
              onClick={limpiarFiltros}
              className="bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ producto, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            Últimas unidades
          </div>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
              Sin Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {producto.nombre}
        </h3>
        {producto.categoria && (
          <p className="text-xs text-gray-500 mb-2">{producto.categoria.nombre}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xl font-bold text-jmr-green">
            ${producto.precio.toFixed(2)}
          </p>
          <button
            onClick={() => onAddToCart(producto, 1)}
            disabled={producto.stock === 0}
            className="bg-jmr-green hover:bg-jmr-green-dark text-white p-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Agregar al carrito"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}