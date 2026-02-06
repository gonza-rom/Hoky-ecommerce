'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Search, Heart, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Cart from './Cart';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const { toggleCart, getItemCount } = useCart();
  const itemCount = getItemCount();

  const categorias = [
    'Mochilas',
    'Bolsos',
    'Carteras',
    'Billeteras',
    'Cinturones',
    'Accesorios'
  ];

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-40">
        {/* Top bar con información */}
        <div className="bg-jmr-green text-white text-xs py-2">
          <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <span>📍 Rivadavia 564 - SFVC / Av Pte Castillo 1165 - Valle Viejo</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+543834927252" className="hover:underline">📞 +54 383 492-7252</a>
              <a href="mailto:cuerosjmr@hotmail.com" className="hover:underline hidden sm:inline">✉️ cuerosjmr@hotmail.com</a>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative w-32 h-16 sm:w-40 sm:h-20">
                <Image
                  src="/logo-jmr.png"
                  alt="Marroquinería JMR"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Productos
              </Link>
              <Link href="/nosotros" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Nosotros
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Contacto
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-jmr-green transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="cart-badge absolute -top-1 -right-1 bg-jmr-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden p-2 text-gray-700 hover:text-jmr-green transition-colors"
              >
                {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="lg:hidden border-t">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link
                href="/"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors"
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors"
              >
                Productos
              </Link>
              <Link
                href="/nosotros"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors"
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Carrito lateral */}
      <Cart />
    </>
  );
}