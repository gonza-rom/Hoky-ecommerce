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

export default function AdminSidebar() {
  const pathname  = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Cerrar el menú al navegar
  useEffect(() => { setAbierto(false); }, [pathname]);

  // Cerrar con Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const NavLinks = () => (
    <>
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const activo = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              fontSize: 13, fontWeight: activo ? 600 : 500,
              color:      activo ? '#fff' : 'rgba(255,255,255,0.5)',
              background: activo ? 'rgba(255,255,255,0.1)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 8,
          fontSize: 13, color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
        }}>
          <LogOut size={16} />
          Ver tienda
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: '#111', color: '#fff',
        display: 'none', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}
        className="admin-sidebar-desktop"
      >
        <Logo />
        <NavLinks />
      </aside>

      {/* ── Mobile header bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#111', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', height: 56,
      }}
        className="admin-mobile-bar"
      >
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          HOKY Admin
        </span>
        <button onClick={() => setAbierto(!abierto)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#fff', display: 'flex', alignItems: 'center', padding: 4,
        }}>
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Spacer para el contenido no quede debajo del header fijo en móvil */}
      <div className="admin-mobile-spacer" style={{ height: 56 }} />

      {/* ── Mobile drawer ── */}
      {abierto && (
        <>
          {/* Overlay */}
          <div onClick={() => setAbierto(false)} style={{
            position: 'fixed', inset: 0, zIndex: 48,
            background: 'rgba(0,0,0,0.5)',
          }} />

          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 56, left: 0, bottom: 0, zIndex: 49,
            width: 260, background: '#111', color: '#fff',
            display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
            animation: 'slideInLeft 0.2s ease-out',
          }}>
            <NavLinks />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        /* Desktop: mostrar sidebar, ocultar mobile bar y spacer */
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: flex !important; }
          .admin-mobile-bar      { display: none  !important; }
          .admin-mobile-spacer   { display: none  !important; }
        }
        /* Móvil: ocultar sidebar desktop */
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
        }
      `}</style>
    </>
  );
}

function Logo() {
  return (
    <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>
        Panel Admin
      </p>
      <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.06em', margin: 0, textTransform: 'uppercase' }}>
        HOKY
      </p>
    </div>
  );
}