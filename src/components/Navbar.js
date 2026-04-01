'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Cart from './Cart';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { toggleCart, getItemCount } = useCart();
  const itemCount = getItemCount();

  const links = [
    { href: '/productos', label: 'Catálogo' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <>
      {/* Banner ticker */}
      <div className="bg-hoky-black text-white overflow-hidden py-2">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-xs tracking-[0.18em] uppercase px-12">
              ENVÍOS A TODO EL PAÍS &nbsp;·&nbsp; NUEVA COLECCIÓN &nbsp;·&nbsp; INDUMENTARIA URBANA
            </span>
          ))}
        </div>
      </div>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Links desktop — izquierda */}
            <div className="hidden lg:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-600 hover:text-hoky-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Logo — centro */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <div className="relative h-10 w-28 md:h-12 md:w-32">
                <Image
                  src="/logo.jpeg"
                  alt="Hoky Indumentaria"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Íconos — derecha */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={toggleCart}
                className="relative p-2 text-hoky-black hover:opacity-60 transition-opacity"
                aria-label="Abrir carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="cart-badge absolute -top-1 -right-1 bg-hoky-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Burger móvil */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden p-2 text-hoky-black hover:opacity-60 transition-opacity"
                aria-label="Menú"
              >
                {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block py-3 text-xs font-semibold tracking-[0.12em] uppercase text-gray-700 hover:text-hoky-black border-b border-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <Cart />
    </>
  );
}