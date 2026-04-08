'use client';
// src/app/admin/page.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tag, ShoppingBag, ArrowRight } from 'lucide-react';

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
    { label: 'Productos',  value: stats.productos,  icon: Package,     href: '/admin/productos',  color: '#111' },
    { label: 'Categorías', value: stats.categorias, icon: Tag,         href: '/admin/categorias', color: '#333' },
    { label: 'Pedidos',    value: stats.pedidos,    icon: ShoppingBag, href: '/admin/pedidos',    color: '#555' },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Bienvenido al panel de Hoky Indumentaria</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="no-underline group">
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 cursor-pointer transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
              <div className="flex sm:w-full items-center justify-between sm:mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: color }}
                >
                  <Icon size={18} color="#fff" />
                </div>
                <ArrowRight size={16} className="text-gray-300 hidden sm:block" />
              </div>
              <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-1 flex-1">
                <p className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">{value}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 sm:hidden ml-auto" />
            </div>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Accesos rápidos
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-wrap">
          {[
            { href: '/admin/productos',  label: '+ Nuevo producto' },
            { href: '/admin/categorias', label: '+ Nueva categoría' },
            { href: '/',                 label: 'Ver tienda →' },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="px-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 text-center transition-all duration-150 hover:bg-gray-900 hover:text-white hover:border-gray-900"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}