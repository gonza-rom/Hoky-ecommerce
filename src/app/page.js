'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Star, TrendingUp, CreditCard, Wallet, QrCode } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

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

  const mediosDePago = [
    { nombre: 'BNA+', logo: 'bna-plus.png' },
    { nombre: 'Mercado Pago', logo: 'mercado-pago.png' },
    { nombre: 'Modo', logo: 'modo.png' },
    { nombre: 'VISA', logo: 'visa.png' },
    { nombre: 'Mastercard', logo: 'mastercard.png' },
    { nombre: 'American Express', logo: 'american-express.png' },
    { nombre: 'Cabal', logo: 'cabal.png' },
    { nombre: 'Naranja X', logo: 'naranja-x.png' },
    { nombre: 'Centrocard', logo: 'centrocard.png' },
    { nombre: 'Sol', logo: 'sol.png' },
  ];

  return (
    <div>
      {/* Hero Section con Galería */}
      <section className="relative bg-gradient-to-r from-jmr-green to-jmr-green-dark text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Marroquinería de Calidad
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Mochilas, bolsos, carteras y más. Las mejores marcas al mejor precio.
                Más de 20 años de experiencia en Catamarca.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
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
              <div className="flex items-center gap-3 text-sm">
                <Wallet className="w-5 h-5" />
                <span>Aceptamos todos los medios de pago</span>
              </div>
            </div>

            {/* Galería de fotos del local */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-48 md:h-64 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/local-fachada.jpg"
                  alt="Fachada Marroquinería JMR"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative h-48 md:h-64 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/local-interior-1.jpg"
                  alt="Interior Marroquinería JMR"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative h-48 md:h-64 rounded-lg overflow-hidden shadow-xl col-span-2">
                <Image
                  src="/local-interior-2.jpg"
                  alt="Productos Marroquinería JMR"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métodos de Pago */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Medios de Pago
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              En nuestras sucursales aceptamos todas las formas de pago para tu comodidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Tarjetas de Débito</h3>
                <p className="text-sm text-gray-600">Todas las tarjetas</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Tarjetas de Crédito</h3>
                <p className="text-sm text-gray-600">En cuotas disponibles</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Transferencias y QR</h3>
                <p className="text-sm text-gray-600">Mercado Pago, Modo, BNA+</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Efectivo</h3>
                <p className="text-sm text-gray-600">Pesos argentinos</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-center font-semibold text-gray-700 mb-6">
              Tarjetas y billeteras aceptadas:
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-4">
              {mediosDePago.map((medio) => (
                <div
                  key={medio.nombre}
                  className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center h-20"
                  title={medio.nombre}
                >
                  <Image
                    src={`/pagos/${medio.logo}`}
                    alt={medio.nombre}
                    width={80}
                    height={50}
                    className="object-contain max-h-12"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-600 text-center">${medio.nombre}</span>`;
                    }}
                  />
                </div>
              ))}
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
                <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {productosDestacados.map((producto) => (
                  // ✅ Usa el componente compartido que soporta imagenes[]
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

      {/* Marcas - Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestras Marcas</h2>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-8">
              {/* Primera vuelta */}
              <MarcaLogo nombre="Alpine Skate" />
              <MarcaLogo nombre="Agarrate Catalina" />
              <MarcaLogo nombre="Carey" />
              <MarcaLogo nombre="Discovery" />
              <MarcaLogo nombre="Elf" />
              <MarcaLogo nombre="Everlast" />
              <MarcaLogo nombre="Influencer" />
              <MarcaLogo nombre="LSYD" />
              <MarcaLogo nombre="Head" />
              <MarcaLogo nombre="Owen" />
              <MarcaLogo nombre="Pierre Cardin" />
              <MarcaLogo nombre="Reef" />
              <MarcaLogo nombre="Unicross" />
              <MarcaLogo nombre="Uniform" />
              <MarcaLogo nombre="Queens" />
              <MarcaLogo nombre="Wilson" />
              <MarcaLogo nombre="Bossi" />
              <MarcaLogo nombre="Amayra" />
              <MarcaLogo nombre="Biwo" />
              {/* Segunda vuelta (duplicado para efecto infinito) */}
              <MarcaLogo nombre="Alpine Skate" />
              <MarcaLogo nombre="Agarrate Catalina" />
              <MarcaLogo nombre="Carey" />
              <MarcaLogo nombre="Discovery" />
              <MarcaLogo nombre="Elf" />
              <MarcaLogo nombre="Everlast" />
              <MarcaLogo nombre="Influencer" />
              <MarcaLogo nombre="LSYD" />
              <MarcaLogo nombre="Head" />
              <MarcaLogo nombre="Owen" />
              <MarcaLogo nombre="Pierre Cardin" />
              <MarcaLogo nombre="Reef" />
              <MarcaLogo nombre="Unicross" />
              <MarcaLogo nombre="Uniform" />
              <MarcaLogo nombre="Queens" />
              <MarcaLogo nombre="Wilson" />
              <MarcaLogo nombre="Bossi" />
              <MarcaLogo nombre="Amayra" />
              <MarcaLogo nombre="Biwo" />
            </div>
          </div>
          
          <p className="text-center text-gray-500 mt-8 text-sm">
            Y muchas marcas más en nuestras sucursales
          </p>
        </div>
      </section>
    </div>
  );
}

function MarcaLogo({ nombre }) {
  return (
    <div className="flex-shrink-0 bg-white px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 min-w-[200px] h-32 flex items-center justify-center">
      <Image
        src={`/marcas/${nombre.toLowerCase().replace(/\s+/g, '-')}.png`}
        alt={`Logo ${nombre}`}
        width={150}
        height={80}
        className="object-contain max-h-20"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<span class="font-bold text-gray-700 text-lg">${nombre}</span>`;
        }}
      />
    </div>
  );
}