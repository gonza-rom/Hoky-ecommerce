'use client';
// src/app/admin/sidebar.js

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Tag, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react';

const NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/admin/productos',  icon: Package,         label: 'Productos'     },
  { href: '/admin/categorias', icon: Tag,             label: 'Categorías'    },
  { href: '/admin/pedidos',    icon: ShoppingBag,     label: 'Pedidos'       },
  { href: '/admin/config',     icon: Settings,        label: 'Configuración' },
];

function Logo() {
  return (
    <div className="px-6 py-5 border-b border-white/10">
      <p className="text-[10px] tracking-[0.2em] uppercase text-white/35 mb-1">Panel Admin</p>
      <p className="text-lg font-extrabold tracking-widest uppercase text-white">HOKY</p>
    </div>
  );
}

function NavLinks({ onNavigate }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const activo = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 no-underline
                ${activo
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-white/40 hover:text-white/70 transition-all duration-150 no-underline"
        >
          <LogOut size={16} />
          Ver tienda
        </Link>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => { setAbierto(false); }, [pathname]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-[#111] text-white sticky top-0 h-screen">
        <Logo />
        <NavLinks />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111] text-white flex items-center justify-between px-4 h-12">
        <span className="text-base font-black tracking-widest uppercase">HOKY Admin</span>
        <button
          onClick={() => setAbierto(!abierto)}
          className="p-1 text-white flex items-center justify-center"
          aria-label="Abrir menú"
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Spacer móvil */}
      <div className="md:hidden h-14" />

      {/* ── Mobile drawer ── */}
      {abierto && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setAbierto(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/50"
          />

          {/* Drawer */}
          <div className="md:hidden fixed top-14 left-0 bottom-0 z-50 w-64 bg-[#111] text-white flex flex-col shadow-2xl animate-slideInLeft">
            <NavLinks onNavigate={() => setAbierto(false)} />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.2s ease-out;
        }
      `}</style>
    </>
  );
}