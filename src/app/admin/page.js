'use client';
// src/app/admin/page.js
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Package, Tag, ShoppingBag, ArrowRight,
  TrendingUp, DollarSign, Clock, CheckCircle,
  AlertTriangle,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ESTADOS = {
  PENDIENTE:      { label: 'Pendiente',      color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  PAGADO:         { label: 'Pagado',         color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  EN_PREPARACION: { label: 'En preparación', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  EN_CAMINO:      { label: 'En camino',      color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  ENTREGADO:      { label: 'Entregado',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  CANCELADO:      { label: 'Cancelado',      color: '#ef4444', bg: '#fff5f5', border: '#fecaca' },
};

// ── Gráfico de barras ─────────────────────────────────────────────────────────
function SalesChart({ data }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!data?.length) return null;

  const max     = Math.max(...data.map(d => d.total), 1);
  const maxLabel = fmtShort(max);

  return (
    <div ref={ref} style={{ width: '100%', background: '#f8fafc', borderRadius: 10, padding: '12px 8px 0' }}>
      {/* Etiqueta max */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>{maxLabel}</span>
      </div>

      {/* Barras */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        height: 140,
        padding: '0 2px',
      }}>
        {data.map((d, i) => {
          const pct      = max > 0 ? (d.total / max) * 100 : 0;
          const esHoy    = i === data.length - 1;
          const altura   = animated ? `${Math.max(pct, d.pedidos > 0 ? 4 : 0)}%` : '0%';

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                height: '100%',
                justifyContent: 'flex-end',
              }}
              title={`${d.label}: ${fmt(d.total)} (${d.pedidos} pedidos)`}
            >
              {/* Valor encima si hay ventas */}
              {d.total > 0 && (
                <span style={{
                  fontSize: 9,
                  color: esHoy ? '#111' : '#aaa',
                  fontWeight: esHoy ? 700 : 500,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  opacity: animated ? 1 : 0,
                  transition: 'opacity 0.4s ease 0.3s',
                }}>
                  {fmtShort(d.total)}
                </span>
              )}

              {/* Barra */}
              <div style={{
                width: '100%',
                height: altura,
                background: esHoy
                  ? '#111'
                  : d.total > 0
                    ? '#475569'
                    : '#e2e8f0',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${i * 0.05}s`,
                minHeight: d.pedidos > 0 ? 4 : 0,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Shimmer en la barra de hoy */}
                {esHoy && animated && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                    animation: 'shimmer 2s infinite',
                  }} />
                )}
              </div>

              {/* Etiqueta día */}
              <span style={{
                fontSize: 10,
                color: esHoy ? '#111' : '#aaa',
                fontWeight: esHoy ? 700 : 400,
                letterSpacing: esHoy ? '0.04em' : 0,
              }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Línea base */}
      <div style={{ height: 1, background: '#e2e8f0', marginTop: 2 }} />

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/productos?pageSize=1').then(r => r.json()),
      fetch('/api/admin/categorias').then(r => r.json()),
      fetch('/api/admin/pedidos?pageSize=200').then(r => r.json()),
      fetch('/api/admin/productos?stockBajo=true&pageSize=5').then(r => r.json()),
    ]).then(([prod, cat, ped, stockBajo]) => {
      const pedidos = ped.data ?? [];

      // Últimos 7 días (incluyendo hoy)
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const fin = new Date(d);
        fin.setHours(23, 59, 59, 999);

        const delDia = pedidos.filter(p => {
          const f = new Date(p.createdAt);
          return f >= d && f <= fin && p.estado !== 'CANCELADO';
        });

        return {
          label:   i === 6 ? 'Hoy' : DIAS[d.getDay()],
          total:   delDia.reduce((a, p) => a + (p.total ?? 0), 0),
          pedidos: delDia.length,
          fecha:   d,
        };
      });

      // Hoy
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      const pedidosHoy = pedidos.filter(p =>
        new Date(p.createdAt) >= hoy && p.estado !== 'CANCELADO'
      );

      // Semana
      const semana = new Date(); semana.setDate(semana.getDate() - 7);
      const pedidosSemana = pedidos.filter(p =>
        new Date(p.createdAt) >= semana && p.estado !== 'CANCELADO'
      );

      // Producto más vendido
      const conteo = {};
      pedidos.forEach(p =>
        (p.items ?? []).forEach(item => {
          conteo[item.nombre] = (conteo[item.nombre] ?? 0) + (item.cantidad ?? 1);
        })
      );
      const masVendido = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])[0] ?? null;

      setStats({
        productos:     prod.pagination?.total ?? 0,
        categorias:    cat.data?.length ?? 0,
        pedidosTotal:  ped.pagination?.total ?? 0,
        pendientes:    pedidos.filter(p => p.estado === 'PENDIENTE').length,
        enPreparacion: pedidos.filter(p => p.estado === 'EN_PREPARACION').length,
        entregados:    pedidos.filter(p => p.estado === 'ENTREGADO').length,
        ventasHoy:     pedidosHoy.reduce((a, p) => a + (p.total ?? 0), 0),
        ventasSemana:  pedidosSemana.reduce((a, p) => a + (p.total ?? 0), 0),
        pedidosHoy:    pedidosHoy.length,
        ultimos:       pedidos.slice(0, 5),
        chartData,
        masVendido,
        stockBajo:     stockBajo.data ?? [],
      });
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-0.5">Dashboard</h1>
        <p className="text-sm text-gray-400">Panel de Hoky Indumentaria</p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: 'Ventas hoy',    value: loading ? '—' : fmt(stats?.ventasHoy),    sub: `${stats?.pedidosHoy ?? 0} pedidos`,  iconBg: 'bg-green-50',  iconColor: 'text-green-600',  valColor: 'text-gray-900' },
          { icon: TrendingUp, label: '7 días',         value: loading ? '—' : fmt(stats?.ventasSemana), sub: 'Últimos 7 días',                       iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   valColor: 'text-gray-900' },
          { icon: Clock,      label: 'Pendientes',     value: loading ? '—' : stats?.pendientes ?? 0,   sub: 'Requieren atención',                   iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  valColor: 'text-amber-500' },
          { icon: CheckCircle,label: 'Entregados',     value: loading ? '—' : stats?.entregados ?? 0,   sub: 'Completados',                          iconBg: 'bg-green-50',  iconColor: 'text-green-600',  valColor: 'text-green-600' },
        ].map(({ icon: Icon, label, value, sub, iconBg, iconColor, valColor }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon size={15} className={iconColor} />
              </div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">{label}</span>
            </div>
            <p className={`text-xl sm:text-2xl font-extrabold mb-0.5 ${valColor}`}>{value}</p>
            <p className="text-[11px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Gráfico + info lateral ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico ventas 7 días */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Ventas últimos 7 días</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? '—' : fmt(stats?.ventasSemana)} en total
              </p>
            </div>
            {!loading && stats?.masVendido && (
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Más vendido</p>
                <p className="text-xs font-bold text-gray-700 max-w-[140px] truncate">{stats.masVendido[0]}</p>
                <p className="text-[11px] text-gray-400">{stats.masVendido[1]} unidades</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-[160px] flex items-end gap-2 px-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 rounded-t-sm animate-pulse bg-gray-100"
                  style={{ height: "40%" }} />
              ))}
            </div>
          ) : (
            <SalesChart data={stats?.chartData ?? []} />
          )}

          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#111]" />
              <span className="text-[11px] text-gray-400">Hoy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
              <span className="text-[11px] text-gray-400">Días anteriores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#e2e8f0]" />
              <span className="text-[11px] text-gray-400">Sin ventas</span>
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-4">

          {/* Estado pedidos */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Estado pedidos</p>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Pendientes',     value: stats?.pendientes ?? 0,    color: '#f59e0b', bg: '#fef3c7' },
                  { label: 'En preparación', value: stats?.enPreparacion ?? 0, color: '#8b5cf6', bg: '#f5f3ff' },
                  { label: 'Entregados',     value: stats?.entregados ?? 0,    color: '#16a34a', bg: '#f0fdf4' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <span className="text-sm font-extrabold px-2 py-0.5 rounded-md"
                      style={{ color, background: bg }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock bajo */}
          {!loading && stats?.stockBajo?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Stock bajo</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {stats.stockBajo.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-xs text-red-700 truncate max-w-[120px]">{p.nombre}</span>
                    <span className="text-xs font-bold text-red-500 flex-shrink-0">{p.stock} u.</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/productos?stockBajo=true"
                className="text-[10px] font-semibold text-red-500 no-underline mt-2 block">
                Ver todos →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Cards nav + últimos pedidos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Cards de navegación */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          {[
            { label: 'Productos',  value: stats?.productos ?? 0,    icon: Package,     href: '/admin/productos',  color: '#111' },
            { label: 'Categorías', value: stats?.categorias ?? 0,   icon: Tag,         href: '/admin/categorias', color: '#333' },
            { label: 'Pedidos',    value: stats?.pedidosTotal ?? 0,  icon: ShoppingBag, href: '/admin/pedidos',    color: '#555' },
          ].map(({ label, value, icon: Icon, href, color }) => (
            <Link key={label} href={href} className="no-underline group">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between group-hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color }}>
                    <Icon size={14} color="#fff" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-gray-900 leading-none">{loading ? '—' : value}</p>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}

          {/* Accesos rápidos */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Accesos rápidos</p>
            <div className="flex flex-col gap-1.5">
              {[
                { href: '/admin/productos',  label: '+ Nuevo producto'  },
                { href: '/admin/categorias', label: '+ Nueva categoría' },
                { href: '/',                 label: 'Ver tienda →'      },
              ].map(({ href, label }) => (
                <Link key={label} href={href}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 text-center transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 no-underline block">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Últimos pedidos */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Últimos pedidos</p>
            <Link href="/admin/pedidos" className="text-xs font-semibold text-gray-500 hover:text-gray-900 no-underline">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="p-5 flex flex-col gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !stats?.ultimos?.length ? (
            <div className="p-10 text-center">
              <ShoppingBag size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.ultimos.map(p => {
                const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-gray-900">#{p.id.slice(-6).toUpperCase()}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap"
                          style={{ background: est.bg, color: est.color, borderColor: est.border }}>
                          {est.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{p.compradorNombre ?? '—'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{fmt(p.total)}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos móvil */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Accesos rápidos</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { href: '/admin/productos',  label: '+ Nuevo producto'  },
            { href: '/admin/categorias', label: '+ Nueva categoría' },
            { href: '/',                 label: 'Ver tienda →'      },
          ].map(({ href, label }) => (
            <Link key={label} href={href}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 no-underline">
              {label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}