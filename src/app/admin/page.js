'use client';
// src/app/admin/page.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tag, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ productos: 0, categorias: 0, pedidos: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/productos?pageSize=1').then(r => r.json()),
      fetch('/api/admin/categorias').then(r => r.json()),
    ]).then(([prod, cat]) => {
      setStats({
        productos:  prod.pagination?.total ?? 0,
        categorias: cat.data?.length ?? 0,
        pedidos:    0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Productos',   value: stats.productos,  icon: Package,     href: '/admin/productos',  color: '#111' },
    { label: 'Categorías',  value: stats.categorias, icon: Tag,         href: '/admin/categorias', color: '#333' },
    { label: 'Pedidos',     value: stats.pedidos,    icon: ShoppingBag, href: '/admin/pedidos',    color: '#555' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Bienvenido al panel de Hoky Indumentaria</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12,
              padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color="#fff" />
                </div>
                <ArrowRight size={16} color="#ccc" />
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{value}</p>
              <p style={{ fontSize: 12, color: '#888', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: '0 0 16px' }}>
          Accesos rápidos
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { href: '/admin/productos', label: '+ Nuevo producto' },
            { href: '/admin/categorias', label: '+ Nueva categoría' },
            { href: '/', label: 'Ver tienda →' },
          ].map(({ href, label }) => (
            <Link key={label} href={href} style={{
              padding: '8px 16px', border: '1px solid #e0dbd5', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#111', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#111'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#e0dbd5'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}