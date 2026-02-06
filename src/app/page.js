'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductosDestacados();
  }, []);

  const fetchProductosDestacados = async () => {
    try {
      const response = await fetch('/api/productos?destacados=true&limit=8');
      const data = await response.json();
      setProductosDestacados(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-jmr-green to-jmr-green-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Marroquinería de Calidad
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Mochilas, bolsos, carteras y más. Las mejores marcas al mejor precio.
                Más de 20 años de experiencia en Catamarca.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/productos"
                  className="bg-white text-jmr-green px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Ver Productos
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://wa.me/543834927252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-jmr-green transition-colors"
                >
                  Contactar
                </a>
              </div>
            </div>
            <div className="relative h-96 hidden md:block">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Productos de las mejores marcas con garantía de calidad
              </p>
            </div>
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Amplio Catálogo</h3>
              <p className="text-gray-600">
                Gran variedad de productos para todas las necesidades
              </p>
            </div>
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">+20 Años</h3>
              <p className="text-gray-600">
                Más de dos décadas de experiencia en el rubro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Productos Destacados</h2>
            <p className="text-gray-600 text-lg">
              Descubre nuestra selección de productos más vendidos
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {productosDestacados.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 bg-jmr-green hover:bg-jmr-green-dark text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                  Ver Todos los Productos
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Marcas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestras Marcas</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              'Alpine Skate', 'Everlast', 'Head', 'Pierre Cardin',
              'Queens', 'Wilson', 'Discovery', 'Bossi'
            ].map((marca) => (
              <div
                key={marca}
                className="bg-white px-6 py-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <span className="font-semibold text-gray-700">{marca}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ producto, onAddToCart }) {
  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden group">
      <div className="relative h-48 bg-gray-100">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {producto.stock <= producto.stockMinimo && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            Últimas unidades
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