'use client';
// src/app/admin/Sidebar.js
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, ShoppingBag, Settings, LogOut } from 'lucide-react';

const NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/admin/productos',  icon: Package,         label: 'Productos'    },
  { href: '/admin/categorias', icon: Tag,             label: 'Categorías'   },
  { href: '/admin/pedidos',    icon: ShoppingBag,     label: 'Pedidos'      },
  { href: '/admin/config',     icon: Settings,        label: 'Configuración'},
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#111', color: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>
          Panel Admin
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.06em', margin: 0, textTransform: 'uppercase' }}>
          HOKY
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const activo = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              fontSize: 13, fontWeight: activo ? 600 : 500,
              color: activo ? '#fff' : 'rgba(255,255,255,0.5)',
              background: activo ? 'rgba(255,255,255,0.1)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
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
    </aside>
  );
}