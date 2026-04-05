'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import Cart from './Cart';

// Email del admin — el único que ve el link al panel
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'hokyindumentaria@gmail.com';

export default function Navbar() {
  const [menuAbierto,    setMenuAbierto]    = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);
  const [user,           setUser]           = useState(null);
  const [loadingUser,    setLoadingUser]    = useState(true);

  const { toggleCart, getItemCount } = useCart();
  const itemCount = getItemCount();
  const userMenuRef = useRef(null);
  const supabase    = createClient();

  const links = [
    { href: '/productos', label: 'Catálogo'  },
    { href: '/nosotros',  label: 'Nosotros'  },
    { href: '/contacto',  label: 'Contacto'  },
  ];

  // ── Cargar usuario ────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingUser(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cerrar menú usuario al clickear afuera
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserMenuAbierto(false);
    window.location.href = '/';
  }

  const esAdmin = user?.email === ADMIN_EMAIL;
  const nombre  = user?.user_metadata?.nombre ?? user?.email?.split('@')[0] ?? 'Mi cuenta';

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
                <Link key={link.href} href={link.href}
                  className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-600 hover:text-hoky-black transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Logo — centro */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <div className="relative h-10 w-28 md:h-12 md:w-32">
                <Image src="/logo.jpeg" alt="Hoky Indumentaria" fill className="object-contain" priority />
              </div>
            </Link>

            {/* Íconos — derecha */}
            <div className="flex items-center gap-1 ml-auto">

              {/* ── Usuario ── */}
              {!loadingUser && (
                user ? (
                  /* Logueado → menú desplegable */
                  <div ref={userMenuRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setUserMenuAbierto(!userMenuAbierto)}
                      className="flex items-center gap-1.5 p-2 text-hoky-black hover:opacity-60 transition-opacity"
                      aria-label="Mi cuenta"
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <User size={14} color="#fff" />
                      </div>
                      <ChevronDown size={12} className="hidden md:block text-gray-400" />
                    </button>

                    {/* Dropdown */}
                    {userMenuAbierto && (
                      <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        background: '#fff', border: '1px solid #e8e5e0',
                        borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        minWidth: 200, zIndex: 100, overflow: 'hidden',
                      }}>
                        {/* Header usuario */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ede8' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {nombre}
                          </p>
                          <p style={{ fontSize: 11, color: '#aaa', margin: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </p>
                        </div>

                        {/* Links */}
                        <div style={{ padding: '6px 0' }}>
                          <Link href="/cuenta" onClick={() => setUserMenuAbierto(false)}
                            style={itemMenuStyle}>
                            <User size={14} /> Mi cuenta
                          </Link>

                          {/* Solo visible para el admin */}
                          {esAdmin && (
                            <Link href="/admin" onClick={() => setUserMenuAbierto(false)}
                              style={{ ...itemMenuStyle, color: '#111', fontWeight: 700 }}>
                              <LayoutDashboard size={14} /> Panel Admin
                            </Link>
                          )}
                        </div>

                        {/* Cerrar sesión */}
                        <div style={{ padding: '6px 0', borderTop: '1px solid #f0ede8' }}>
                          <button onClick={handleLogout} style={{ ...itemMenuStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <LogOut size={14} /> Cerrar sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* No logueado → botón iniciar sesión */
                  <Link href="/auth/login"
                    className="hidden md:flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-gray-600 hover:text-hoky-black transition-colors p-2">
                    <User size={16} />
                    <span>Ingresar</span>
                  </Link>
                )
              )}

              {/* Carrito */}
              <button onClick={toggleCart}
                className="relative p-2 text-hoky-black hover:opacity-60 transition-opacity"
                aria-label="Abrir carrito">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="cart-badge absolute -top-1 -right-1 bg-hoky-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Burger móvil */}
              <button onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden p-2 text-hoky-black hover:opacity-60 transition-opacity"
                aria-label="Menú">
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
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block py-3 text-xs font-semibold tracking-[0.12em] uppercase text-gray-700 hover:text-hoky-black border-b border-gray-100 transition-colors">
                  {link.label}
                </Link>
              ))}

              {/* Auth en móvil */}
              <div className="pt-2">
                {user ? (
                  <>
                    <Link href="/cuenta" onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-gray-700 hover:text-hoky-black border-b border-gray-100 transition-colors">
                      <User size={14} /> Mi cuenta
                    </Link>
                    {esAdmin && (
                      <Link href="/admin" onClick={() => setMenuAbierto(false)}
                        className="flex items-center gap-2 py-3 text-xs font-bold tracking-[0.12em] uppercase text-hoky-black border-b border-gray-100">
                        <LayoutDashboard size={14} /> Panel Admin
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-red-400 w-full">
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-2 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-gray-700 hover:text-hoky-black transition-colors">
                    <User size={14} /> Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <Cart />
    </>
  );
}

const itemMenuStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '9px 16px', fontSize: 13, color: '#444',
  textDecoration: 'none', transition: 'background 0.1s',
  cursor: 'pointer',
};