'use client';
// src/app/admin/pedidos/page.js

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, X, Loader2, Eye, Package, RefreshCw, Truck } from 'lucide-react';

const ESTADOS = {
  PENDIENTE:      { label: 'Pendiente',      color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  PAGADO:         { label: 'Pagado',         color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  EN_PREPARACION: { label: 'En preparación', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  EN_CAMINO:      { label: 'En camino',      color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  ENTREGADO:      { label: 'Entregado',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  CANCELADO:      { label: 'Cancelado',      color: '#ef4444', bg: '#fff5f5', border: '#fecaca' },
  REEMBOLSADO:    { label: 'Reembolsado',    color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const FLUJO_ESTADOS = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO'];

export default function AdminPedidosPage() {
  const [pedidos,      setPedidos]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page,         setPage]         = useState(1);
  const [pagination,   setPagination]   = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: 20 });
      if (busqueda)     params.set('q',      busqueda);
      if (filtroEstado) params.set('estado', filtroEstado);
      const res  = await fetch(`/api/admin/pedidos?${params}`);
      const data = await res.json();
      setPedidos(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch { setPedidos([]); }
    finally  { setLoading(false); }
  }, [page, busqueda, filtroEstado]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  async function cambiarEstado(pedidoId, nuevoEstado) {
    setCambiandoEstado(true);
    try {
      const res  = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.ok) {
        setPedidoDetalle(prev => prev ? { ...prev, estado: nuevoEstado } : null);
        fetchPedidos();
      }
    } finally { setCambiandoEstado(false); }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Pedidos</h1>
          <p className="text-sm text-gray-400">{pagination?.total ?? 0} pedidos en total</p>
        </div>
        <button onClick={fetchPedidos}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-lg text-sm flex-shrink-0 hover:bg-gray-50 transition-colors">
          <RefreshCw size={13} /> <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Pendientes',     value: pedidos.filter(p => p.estado === 'PENDIENTE').length,      color: 'text-amber-500'  },
          { label: 'En preparación', value: pedidos.filter(p => p.estado === 'EN_PREPARACION').length, color: 'text-violet-500' },
          { label: 'En camino',      value: pedidos.filter(p => p.estado === 'EN_CAMINO').length,      color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
            <p className={`text-2xl sm:text-3xl font-extrabold ${color} mb-0.5`}>{value}</p>
            <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPage(1); }}
            placeholder="Buscar pedido, cliente..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400" />
        </div>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-gray-400">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {(busqueda || filtroEstado) && (
          <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setPage(1); }}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-50">
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Lista — tabla en desktop, cards en móvil */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={28} className="text-gray-300 animate-spin mx-auto" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No hay pedidos.</p>
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Pedido', 'Cliente', 'Fecha', 'Total', 'Pago', 'Estado', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p, i) => {
                    const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                    return (
                      <tr key={p.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#111]">#{p.id.slice(-8).toUpperCase()}</p>
                          <p className="text-[11px] text-gray-400">
                            {p.tipoEnvio === 'envio' ? 'Envío' : p.tipoEnvio === 'local' ? 'Envío local' : 'Retiro'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#111]">{p.compradorNombre ?? '—'}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{p.compradorEmail ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#111]">${p.total?.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {p.metodoPago === 'mercadopago' ? 'MP' : p.metodoPago === 'transferencia' ? 'Transfer.' : 'Efectivo'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md border whitespace-nowrap"
                            style={{ background: est.bg, color: est.color, borderColor: est.border }}>
                            {est.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setPedidoDetalle(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                            <Eye size={11} /> Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className="md:hidden divide-y divide-gray-100">
              {pedidos.map(p => {
                const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                return (
                  <div key={p.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-[#111]">#{p.id.slice(-8).toUpperCase()}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border"
                          style={{ background: est.bg, color: est.color, borderColor: est.border }}>
                          {est.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{p.compradorNombre ?? '—'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString('es-AR')} · ${p.total?.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <button onClick={() => setPedidoDetalle(p)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 flex-shrink-0">
                      <Eye size={11} /> Ver
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Página {page} de {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 disabled:opacity-40">
                ← Anterior
              </button>
              <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 disabled:opacity-40">
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {pedidoDetalle && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6 bg-black/60"
          onClick={() => setPedidoDetalle(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold">Pedido #{pedidoDetalle.id.slice(-8).toUpperCase()}</h2>
                <p className="text-xs text-gray-400">
                  {new Date(pedidoDetalle.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setPedidoDetalle(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">

              {/* Flujo de estado */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Estado del pedido</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {FLUJO_ESTADOS.map((est, i) => {
                    const info   = ESTADOS[est];
                    const actual = pedidoDetalle.estado === est;
                    const pasado = FLUJO_ESTADOS.indexOf(pedidoDetalle.estado) > i;
                    return (
                      <button key={est} onClick={() => cambiarEstado(pedidoDetalle.id, est)}
                        disabled={cambiandoEstado}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all"
                        style={{
                          background: actual ? info.bg : pasado ? '#f9f9f9' : '#fff',
                          color: actual ? info.color : pasado ? '#bbb' : '#888',
                          borderColor: actual ? info.border : '#e0dbd5',
                        }}>
                        {info.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!['CANCELADO', 'REEMBOLSADO', 'ENTREGADO'].includes(pedidoDetalle.estado) && (
                    <button onClick={() => cambiarEstado(pedidoDetalle.id, 'CANCELADO')} disabled={cambiandoEstado}
                      className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                      Cancelar pedido
                    </button>
                  )}
                  {pedidoDetalle.estado === 'PAGADO' && (
                    <button onClick={() => cambiarEstado(pedidoDetalle.id, 'REEMBOLSADO')} disabled={cambiandoEstado}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                      Marcar reembolsado
                    </button>
                  )}
                </div>
              </div>

              {/* Comprador */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Comprador</p>
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                  <InfoRow label="Nombre"   value={pedidoDetalle.compradorNombre ?? '—'} />
                  <InfoRow label="Email"    value={pedidoDetalle.compradorEmail ?? '—'} />
                  <InfoRow label="Teléfono" value={pedidoDetalle.compradorTelefono ?? '—'} />
                  <InfoRow label="Entrega" value={
                    pedidoDetalle.tipoEnvio === 'envio'  ? 'Envío a domicilio' :
                    pedidoDetalle.tipoEnvio === 'local'  ? 'Envío local (domicilio)' :
                    'Retiro en local'
                  } />
                  <InfoRow label="Pago"     value={pedidoDetalle.metodoPago === 'mercadopago' ? 'Mercado Pago' : pedidoDetalle.metodoPago === 'transferencia' ? 'Transferencia' : 'Efectivo'} />
                  {pedidoDetalle.notas && <InfoRow label="Notas" value={pedidoDetalle.notas} />}
                </div>
                {pedidoDetalle.compradorTelefono && (
                  <a href={`https://wa.me/${pedidoDetalle.compradorTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pedidoDetalle.compradorNombre ?? ''}! Te contactamos por tu pedido #${pedidoDetalle.id.slice(-8).toUpperCase()} en Hoky.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#25D366] font-semibold no-underline">
                    Contactar por WhatsApp →
                  </a>
                )}
              </div>
              {/* Entrega local con mapa */}
              {pedidoDetalle.tipoEnvio === 'local' && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Entrega local</p>
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                    {pedidoDetalle.localCalle && (
                      <InfoRow label="Dirección" value={`${pedidoDetalle.localCalle} ${pedidoDetalle.localNumero ?? ''}`.trim()} />
                    )}
                    {pedidoDetalle.localBarrio && (
                      <InfoRow label="Barrio / Ref." value={pedidoDetalle.localBarrio} />
                    )}
                    {pedidoDetalle.localLat && pedidoDetalle.localLng && (
                      <a
                        href={`https://www.google.com/maps?q=${pedidoDetalle.localLat},${pedidoDetalle.localLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 font-semibold mt-1"
                      >
                        📍 Ver en Google Maps →
                      </a>
                    )}
                  </div>
                  {pedidoDetalle.localLat && pedidoDetalle.localLng && (
                    <iframe
                      src={
                        'https://www.openstreetmap.org/export/embed.html?bbox=' +
                        (pedidoDetalle.localLng - 0.004) + ',' +
                        (pedidoDetalle.localLat - 0.004) + ',' +
                        (pedidoDetalle.localLng + 0.004) + ',' +
                        (pedidoDetalle.localLat + 0.004) +
                        '&layer=mapnik&marker=' +
                        pedidoDetalle.localLat + ',' +
                        pedidoDetalle.localLng
                      }
                      style={{ width: '100%', height: 180, borderRadius: 12, border: '1px solid #e5e7eb', marginTop: 8 }}
                    />
                  )}
                </div>
              )}

              {/* Envío a domicilio */}
              {pedidoDetalle.tipoEnvio === 'envio' && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Dirección de envío</p>
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                    <InfoRow label="Calle"     value={`${pedidoDetalle.envCalle ?? ''} ${pedidoDetalle.envNumero ?? ''}`.trim() || '—'} />
                    {pedidoDetalle.envPiso && <InfoRow label="Piso/Depto" value={pedidoDetalle.envPiso} />}
                    <InfoRow label="Ciudad"    value={pedidoDetalle.envCiudad    ?? '—'} />
                    <InfoRow label="Provincia" value={pedidoDetalle.envProvincia ?? '—'} />
                    <InfoRow label="CP"        value={pedidoDetalle.envCodigoPostal ?? '—'} />
                  </div>
                </div>
              )}
              {/* Productos */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Productos</p>
                <div className="flex flex-col gap-2">
                  {(pedidoDetalle.items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                      {item.imagen && <img src={item.imagen} alt={item.nombre} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111] truncate">{item.nombre}</p>
                        {(item.talle || item.color) && (
                          <p className="text-[11px] text-gray-400">{[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">x{item.cantidad}</p>
                        <p className="text-sm font-bold text-[#111]">${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                <InfoRow label="Subtotal" value={`$${pedidoDetalle.subtotal?.toLocaleString('es-AR')}`} />
                <InfoRow label="Envío"    value={pedidoDetalle.costoEnvio === 0 ? 'Gratis' : `$${pedidoDetalle.costoEnvio?.toLocaleString('es-AR')}`} />
                <div className="flex justify-between font-extrabold text-sm border-t border-gray-200 pt-2 mt-1">
                  <span>Total</span>
                  <span>${pedidoDetalle.total?.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-[#111] text-right">{value}</span>
    </div>
  );
}