'use client';
// src/app/admin/pedidos/page.js

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, X, Loader2, Eye, ChevronDown, Package, Truck, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

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
  const [pedidos,    setPedidos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [busqueda,   setBusqueda]   = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);

  // Modal detalle
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: 20 });
      if (busqueda)      params.set('q',      busqueda);
      if (filtroEstado)  params.set('estado', filtroEstado);

      const res  = await fetch(`/api/admin/pedidos?${params}`);
      const data = await res.json();
      setPedidos(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch { setPedidos([]); }
    finally   { setLoading(false); }
  }, [page, busqueda, filtroEstado]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  async function cambiarEstado(pedidoId, nuevoEstado) {
    setCambiandoEstado(true);
    try {
      const res  = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.ok) {
        setPedidoDetalle(prev => prev ? { ...prev, estado: nuevoEstado } : null);
        fetchPedidos();
      }
    } finally { setCambiandoEstado(false); }
  }

  const totalPedidos  = pagination?.total ?? 0;
  const pendientes    = pedidos.filter(p => p.estado === 'PENDIENTE').length;
  const enPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Pedidos</h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{totalPedidos} pedidos en total</p>
        </div>
        <button onClick={fetchPedidos} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '1px solid #e0dbd5', color: '#555',
          padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
        }}>
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* KPIs rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pendientes',      value: pedidos.filter(p => p.estado === 'PENDIENTE').length,      color: '#f59e0b' },
          { label: 'En preparación',  value: pedidos.filter(p => p.estado === 'EN_PREPARACION').length, color: '#8b5cf6' },
          { label: 'En camino',       value: pedidos.filter(p => p.estado === 'EN_CAMINO').length,      color: '#f97316' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', color }}>{value}</p>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre, email o N° pedido..."
            style={{ width: '100%', padding: '9px 12px 9px 30px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 13, background: '#fff', color: '#111', outline: 'none' }}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {(busqueda || filtroEstado) && (
          <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setPage(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', border: '1px solid #e0dbd5', borderRadius: 8, background: 'transparent', fontSize: 13, cursor: 'pointer', color: '#888' }}>
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <ShoppingBag size={40} color="#ddd" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>No hay pedidos.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede8' }}>
                {['Pedido', 'Cliente', 'Fecha', 'Total', 'Pago', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p, i) => {
                const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                return (
                  <tr key={p.id} style={{ borderBottom: i < pedidos.length - 1 ? '1px solid #f7f4f0' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 700, color: '#111', margin: '0 0 2px' }}>#{p.id.slice(-8).toUpperCase()}</p>
                      <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{p.tipoEnvio === 'envio' ? '🚚 Envío' : '🏪 Retiro'}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{p.compradorNombre ?? '—'}</p>
                      <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{p.compradorEmail ?? ''}</p>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#888' }}>
                      {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111' }}>
                      ${p.total?.toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#888', textTransform: 'capitalize' }}>
                      {p.metodoPago === 'mercadopago' ? '💳 MP' : p.metodoPago === 'transferencia' ? '🏦 Transfer.' : '💵 Efectivo'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                        background: est.bg, color: est.color, border: `1px solid ${est.border}`,
                        whiteSpace: 'nowrap',
                      }}>{est.label}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => setPedidoDetalle(p)} style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                        border: '1px solid #e0dbd5', borderRadius: 6, background: 'transparent',
                        cursor: 'pointer', fontSize: 12, color: '#555',
                      }}>
                        <Eye size={12} /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#888' }}>Página {page} de {pagination.totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '6px 12px', border: '1px solid #e0dbd5', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#555', opacity: page === 1 ? 0.4 : 1 }}>
                ← Anterior
              </button>
              <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '6px 12px', border: '1px solid #e0dbd5', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#555', opacity: page === pagination.totalPages ? 0.4 : 1 }}>
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal detalle pedido ── */}
      {pedidoDetalle && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '24px 16px', background: 'rgba(0,0,0,0.6)',
        }} onClick={() => setPedidoDetalle(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>Pedido #{pedidoDetalle.id.slice(-8).toUpperCase()}</h2>
                <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
                  {new Date(pedidoDetalle.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={() => setPedidoDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa' }}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '75vh', overflowY: 'auto' }}>

              {/* Estado actual + cambio */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 12px' }}>Estado del pedido</p>
                {/* Flujo visual */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                  {FLUJO_ESTADOS.map((est, i) => {
                    const info    = ESTADOS[est];
                    const actual  = pedidoDetalle.estado === est;
                    const pasado  = FLUJO_ESTADOS.indexOf(pedidoDetalle.estado) > i;
                    return (
                      <div key={est} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => cambiarEstado(pedidoDetalle.id, est)}
                          disabled={cambiandoEstado}
                          style={{
                            padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6,
                            border: `1px solid ${actual ? info.border : '#e0dbd5'}`,
                            background: actual ? info.bg : pasado ? '#f9f9f9' : '#fff',
                            color: actual ? info.color : pasado ? '#bbb' : '#888',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {info.label}
                        </button>
                        {i < FLUJO_ESTADOS.length - 1 && <span style={{ fontSize: 10, color: '#ddd' }}>→</span>}
                      </div>
                    );
                  })}
                </div>
                {/* Cancelar / Reembolsar */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {!['CANCELADO', 'REEMBOLSADO', 'ENTREGADO'].includes(pedidoDetalle.estado) && (
                    <button onClick={() => cambiarEstado(pedidoDetalle.id, 'CANCELADO')} disabled={cambiandoEstado}
                      style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #fecaca', borderRadius: 6, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                      Cancelar pedido
                    </button>
                  )}
                  {pedidoDetalle.estado === 'PAGADO' && (
                    <button onClick={() => cambiarEstado(pedidoDetalle.id, 'REEMBOLSADO')} disabled={cambiandoEstado}
                      style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e0dbd5', borderRadius: 6, background: 'transparent', color: '#888', cursor: 'pointer' }}>
                      Marcar reembolsado
                    </button>
                  )}
                </div>
              </div>

              {/* Datos del comprador */}
              <div>
                <p style={secTitulo}>Comprador</p>
                <div style={infoBox}>
                  <InfoRow label="Nombre"    value={pedidoDetalle.compradorNombre ?? '—'} />
                  <InfoRow label="Email"     value={pedidoDetalle.compradorEmail ?? '—'} />
                  <InfoRow label="Teléfono"  value={pedidoDetalle.compradorTelefono ?? '—'} />
                  <InfoRow label="Entrega"   value={pedidoDetalle.tipoEnvio === 'envio' ? '🚚 Envío a domicilio' : '🏪 Retiro en local'} />
                  <InfoRow label="Pago"      value={pedidoDetalle.metodoPago === 'mercadopago' ? '💳 Mercado Pago' : pedidoDetalle.metodoPago === 'transferencia' ? '🏦 Transferencia' : '💵 Efectivo'} />
                  {pedidoDetalle.notas && <InfoRow label="Notas" value={pedidoDetalle.notas} />}
                </div>
                {pedidoDetalle.compradorTelefono && (
                  <a href={`https://wa.me/${pedidoDetalle.compradorTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pedidoDetalle.compradorNombre ?? ''}! Te contactamos por tu pedido #${pedidoDetalle.id.slice(-8).toUpperCase()} en Hoky.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>
                    💬 Contactar por WhatsApp
                  </a>
                )}
              </div>

              {/* Productos */}
              <div>
                <p style={secTitulo}>Productos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(pedidoDetalle.items ?? []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: '#fafaf8', borderRadius: 8 }}>
                      {item.imagen && <img src={item.imagen} alt={item.nombre} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{item.nombre}</p>
                        {(item.talle || item.color) && (
                          <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                            {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>x{item.cantidad}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div style={infoBox}>
                <InfoRow label="Subtotal"  value={`$${pedidoDetalle.subtotal?.toLocaleString('es-AR')}`} />
                <InfoRow label="Envío"     value={pedidoDetalle.costoEnvio === 0 ? 'Gratis' : `$${pedidoDetalle.costoEnvio?.toLocaleString('es-AR')}`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, borderTop: '1px solid #f0ede8', paddingTop: 8, marginTop: 4 }}>
                  <span>Total</span>
                  <span>${pedidoDetalle.total?.toLocaleString('es-AR')}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#111', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const secTitulo = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 10px' };
const infoBox   = { background: '#fafaf8', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 };