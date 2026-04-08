'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import Cart from './Cart';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'hokyindumentaria@gmail.com';

export default function Navbar() {
  const [menuAbierto,     setMenuAbierto]     = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);
  const [user,            setUser]            = useState(null);
  const [loadingUser,     setLoadingUser]     = useState(true);

  const { toggleCart, getItemCount } = useCart();
  const itemCount   = getItemCount();
  const userMenuRef = useRef(null);
  const supabase    = useMemo(() => createClient(), []);

  const links = [
    { href: '/productos', label: 'Catálogo' },
    { href: '/nosotros',  label: 'Nosotros' },
    { href: '/contacto',  label: 'Contacto' },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingUser(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

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
      {/* ── Ticker ── */}
      <div className="bg-hoky-black text-white overflow-hidden py-2">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-xs tracking-[0.18em] uppercase px-12">
              ENVÍOS A TODO EL PAÍS &nbsp;·&nbsp; NUEVA COLECCIÓN &nbsp;·&nbsp; INDUMENTARIA URBANA
            </span>
          ))}
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 items-center h-14 md:h-16">

            {/* ── Col izquierda: usuario (desktop) + links desktop ── */}
            <div className="flex items-center gap-1 lg:gap-1">

              {/* Ícono usuario — visible en móvil y desktop, siempre a la izquierda */}
              {!loadingUser && (
                user ? (
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setUserMenuAbierto(!userMenuAbierto)}
                      className="flex items-center gap-1 p-2 text-hoky-black hover:opacity-60 transition-opacity"
                      aria-label="Mi cuenta"
                    >
                      <div className="w-7 h-7 rounded-full bg-hoky-black flex items-center justify-center flex-shrink-0">
                        <User size={13} color="#fff" />
                      </div>
                      <ChevronDown size={11} className="hidden md:block text-gray-400" />
                    </button>

                    {/* Dropdown usuario */}
                    {userMenuAbierto && (
                      <div className="absolute left-0 top-[calc(100%+8px)] bg-white border border-gray-200 rounded-xl shadow-xl min-w-[200px] z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-[13px] font-bold text-hoky-black truncate max-w-[160px]">{nombre}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{user.email}</p>
                        </div>
                        <div className="py-1.5">
                          <Link href="/cuenta" onClick={() => setUserMenuAbierto(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors no-underline">
                            <User size={14} /> Mi cuenta
                          </Link>
                          {esAdmin && (
                            <Link href="/admin" onClick={() => setUserMenuAbierto(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-hoky-black hover:bg-gray-50 transition-colors no-underline">
                              <LayoutDashboard size={14} /> Panel Admin
                            </Link>
                          )}
                        </div>
                        <div className="py-1.5 border-t border-gray-100">
                          <button onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                            <LogOut size={14} /> Cerrar sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth/login"
                    className="flex items-center gap-1.5 p-2 text-xs font-semibold tracking-[0.08em] uppercase text-gray-600 hover:text-hoky-black transition-colors">
                    <User size={15} />
                    <span className="hidden lg:inline">Ingresar</span>
                  </Link>
                )
              )}

              {/* Links de navegación — solo desktop, después del ícono de usuario */}
              <div className="hidden lg:flex items-center gap-5">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}
                    className="text-xs font-semibold tracking-[0.12em] uppercase text-gray-600 hover:text-hoky-black transition-colors whitespace-nowrap">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Col centro: logo ── */}
            <div className="flex justify-center">
              <Link href="/">
                <div className="relative h-9 w-24 md:h-11 md:w-28">
                  <Image
                    src="/logo.jpeg"
                    alt="Hoky Indumentaria"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* ── Col derecha: carrito + hamburguesa ── */}
            <div className="flex items-center justify-end gap-0.5">

              {/* Carrito */}
              <button onClick={toggleCart}
                className="relative p-2 text-hoky-black hover:opacity-60 transition-opacity"
                aria-label="Abrir carrito">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="cart-badge absolute -top-0.5 -right-0.5 bg-hoky-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Hamburguesa móvil */}
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

        {/* ── Menú móvil expandido ── */}
        {menuAbierto && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="container mx-auto px-4 py-3 space-y-0.5">
              {links.map((link) => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center py-3 text-xs font-semibold tracking-[0.12em] uppercase text-gray-700 hover:text-hoky-black border-b border-gray-100 transition-colors">
                  {link.label}
                </Link>
              ))}

              <div className="pt-1">
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