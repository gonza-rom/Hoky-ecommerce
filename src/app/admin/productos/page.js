'use client';
// src/app/admin/productos/page.js

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Package, AlertTriangle, Pencil, Trash2, X, Star, Loader2 } from 'lucide-react';
import MultipleImageUpload from '@/components/admin/MultipleImageUpload';

const PAGE_SIZE = 20;
const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44','46', '48', '50','52'];

const FORM_VACIO = {
  nombre: '', descripcion: '', codigoProducto: '', codigoBarras: '',
  precio: '', precioAnterior: '', costo: '',
  descuentoEfectivo: '10',
  stock: '0', stockMinimo: '1',
  unidad: '', imagen: '', imagenes: [], categoriaId: '',
  destacado: false, tieneVariantes: false,
};

function formatPrecio(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function AdminProductosPage() {
  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]); // categorías con hijos
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  const [busqueda,    setBusqueda]    = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [page,        setPage]        = useState(1);

  const [modal,             setModal]             = useState(null);
  const [form,              setForm]              = useState(FORM_VACIO);
  const [variantes,         setVariantes]         = useState([]);
  const [precioPorVariante, setPrecioPorVariante] = useState(false);
  const [guardando,         setGuardando]         = useState(false);
  const [errorModal,        setErrorModal]        = useState('');
  const [confirmDel,        setConfirmDel]        = useState(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (busqueda)    params.set('q',           busqueda);
      if (categoriaId) params.set('categoriaId', categoriaId);
      const res  = await fetch(`/api/admin/productos?${params}`);
      const data = await res.json();
      setProductos(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch { setProductos([]); }
    finally  { setLoading(false); }
  }, [page, busqueda, categoriaId]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  useEffect(() => {
    fetch('/api/admin/categorias')
      .then(r => r.json())
      .then(d => setCategorias(d.data ?? []))
      .catch(() => {});
  }, []);

  // Lista plana de categorías + subcategorías para el select del filtro
  const todasLasCats = categorias.flatMap(c => [c, ...(c.hijos ?? [])]);

  function abrirNuevo() {
    setForm(FORM_VACIO);
    setVariantes([]);
    setPrecioPorVariante(false);
    setErrorModal('');
    setModal('nuevo');
  }

  async function abrirEditar(producto) {
    setForm({
      nombre:            producto.nombre,
      descripcion:       producto.descripcion    ?? '',
      codigoProducto:    producto.codigoProducto ?? '',
      codigoBarras:      producto.codigoBarras   ?? '',
      precio:            String(producto.precio),
      precioAnterior:    producto.precioAnterior ? String(producto.precioAnterior) : '',
      costo:             producto.costo          ? String(producto.costo)          : '',
      descuentoEfectivo: String(producto.descuentoEfectivo ?? 10),
      stock:             String(producto.stock),
      stockMinimo:       String(producto.stockMinimo),
      unidad:            producto.unidad    ?? '',
      imagen:            producto.imagen    ?? '',
      imagenes:          producto.imagenes  ?? [],
      categoriaId:       producto.categoriaId ?? '',
      destacado:         producto.destacado  ?? false,
      tieneVariantes:    producto.tieneVariantes ?? false,
    });
    setVariantes([]);
    setErrorModal('');
    setModal(producto);

    if (producto.tieneVariantes) {
      try {
        const res  = await fetch(`/api/admin/productos/${producto.id}/variantes`);
        const data = await res.json();
        if (data.ok) {
          setVariantes(data.data.map(v => ({
            id:     v.id,
            talle:  v.talle ?? '',
            color:  v.color ?? '',
            stock:  String(v.stock),
            precio: v.precio ? String(v.precio) : '',
            activo: v.activo,
          })));
        }
      } catch {}
    }
  }

  async function guardar() {
    if (!form.nombre.trim()) { setErrorModal('El nombre es requerido'); return; }
    if (!form.precio || parseFloat(form.precio) <= 0) { setErrorModal('El precio debe ser mayor a 0'); return; }
    if (form.tieneVariantes && variantes.length === 0) { setErrorModal('Agregá al menos una variante'); return; }

    setGuardando(true); setErrorModal('');
    const esEdicion = modal !== 'nuevo';

    const payload = {
      ...form,
      precio:            parseFloat(form.precio),
      precioAnterior:    form.precioAnterior ? parseFloat(form.precioAnterior) : null,
      costo:             form.costo ? parseFloat(form.costo) : null,
      descuentoEfectivo: parseFloat(form.descuentoEfectivo) || 10,
      stock:             form.tieneVariantes ? 0 : parseInt(form.stock) || 0,
      stockMinimo:       parseInt(form.stockMinimo) || 1,
      variantes:         form.tieneVariantes ? variantes.map(v => ({
        id:     v.id,
        talle:  v.talle || null,
        color:  v.color.trim(),
        stock:  parseInt(v.stock) || 0,
        precio: precioPorVariante && v.precio ? parseFloat(v.precio) : null,
        activo: v.activo ?? true,
      })) : [],
    };

    try {
      const res = await fetch(
        esEdicion ? `/api/admin/productos/${modal.id}` : '/api/admin/productos',
        { method: esEdicion ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (!data.ok) { setErrorModal(data.error ?? 'Error al guardar'); return; }
      setModal(null);
      fetchProductos();
    } catch { setErrorModal('Error de conexión'); }
    finally  { setGuardando(false); }
  }

  async function eliminar(id) {
    try {
      await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
      setConfirmDel(null);
      fetchProductos();
    } catch { alert('Error al eliminar'); }
  }

  const agregarVariante = () =>
    setVariantes(prev => [...prev, { talle: 'M', color: '', stock: '0', precio: '', activo: true }]);
  const actualizarVariante = (i, campo, valor) =>
    setVariantes(prev => prev.map((v, idx) => idx === i ? { ...v, [campo]: valor } : v));
  const eliminarVariante = (i) =>
    setVariantes(prev => prev.filter((_, idx) => idx !== i));
  const stockTotalVariantes = variantes.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        .prod-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:12px; }
        .prod-filters { background:#fff; border:1px solid #e8e5e0; border-radius:12px; padding:16px; margin-bottom:16px; display:flex; gap:12px; flex-wrap:wrap; }
        .prod-filters-search { flex:1; min-width:160px; }
        .prod-table-wrap { background:#fff; border:1px solid #e8e5e0; border-radius:12px; overflow:hidden; }
        .prod-table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .prod-table { width:100%; border-collapse:collapse; font-size:13px; min-width:520px; }
        .prod-modal-overlay { position:fixed; inset:0; z-index:50; overflow-y:auto; display:flex; align-items:flex-start; justify-content:center; padding:24px 16px; background:rgba(0,0,0,0.6); }
        .prod-modal { background:#fff; border-radius:16px; width:100%; max-width:640px; box-shadow:0 24px 48px rgba(0,0,0,0.15); }
        .prod-modal-body { padding:24px; display:flex; flex-direction:column; gap:20px; max-height:70vh; overflow-y:auto; }
        .grid-2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .grid-3col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
        .precios-preview { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
        .variantes-grid { display:grid; gap:8px; align-items:center; }
        .variantes-grid-header { display:grid; gap:8px; }
        .paginacion { padding:12px 16px; border-top:1px solid #f0ede8; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        @media (max-width:600px) {
          .prod-header { flex-direction:column; align-items:flex-start; }
          .prod-header button { width:100%; justify-content:center; }
          .prod-filters { flex-direction:column; }
          .col-categoria,.col-precio { display:none; }
          .prod-modal-overlay { padding:0; align-items:flex-end; }
          .prod-modal { border-radius:16px 16px 0 0; max-width:100%; }
          .prod-modal-body { max-height:80vh; }
          .grid-2col { grid-template-columns:1fr; }
          .grid-3col { grid-template-columns:1fr 1fr; }
          .precios-preview { grid-template-columns:1fr; }
          .variantes-grid,.variantes-grid-header { grid-template-columns:80px 1fr 60px 28px !important; }
          .variantes-grid.con-precio,.variantes-grid-header.con-precio { grid-template-columns:70px 1fr 55px 80px 28px !important; }
        }
        @media (min-width:601px) and (max-width:860px) {
          .col-categoria { display:none; }
          .precios-preview { grid-template-columns:1fr 1fr; }
          .grid-3col { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="prod-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Productos</h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{pagination?.total ?? 0} productos en total</p>
        </div>
        <button onClick={abrirNuevo} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#111', color: '#fff', border: 'none',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="prod-filters">
        <div className="prod-filters-search" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o código..."
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Select de categoría con subcategorías */}
        <select value={categoriaId} onChange={e => { setCategoriaId(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#111' }}>
          <option value="">Todas las categorías</option>
          <option value="sin-categoria">Sin categoría</option>
          {categorias.map(c => (
            <optgroup key={c.id} label={c.nombre}>
              <option value={c.id}>{c.nombre} (todas)</option>
              {(c.hijos ?? []).map(h => (
                <option key={h.id} value={h.id}>↳ {h.nombre}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {(busqueda || categoriaId) && (
          <button onClick={() => { setBusqueda(''); setCategoriaId(''); setPage(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', border: '1px solid #e0dbd5', borderRadius: 8, background: 'transparent', fontSize: 13, cursor: 'pointer', color: '#888' }}>
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="prod-table-wrap">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : productos.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Package size={40} color="#ddd" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>No hay productos. Creá el primero.</p>
          </div>
        ) : (
          <div className="prod-table-scroll">
            <table className="prod-table">
              <thead>
                <tr style={{ borderBottom: '1px solid #f0ede8' }}>
                  <th style={thStyle('left')}>Producto</th>
                  <th className="col-categoria" style={thStyle('left')}>Categoría</th>
                  <th className="col-precio" style={thStyle('right')}>Precio</th>
                  <th style={thStyle('right')}>Stock</th>
                  <th style={thStyle('right')}></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, i) => {
                  const stockBajo = p.stock <= p.stockMinimo;
                  return (
                    <tr key={p.id}
                      style={{ borderBottom: i < productos.length - 1 ? '1px solid #f7f4f0' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.imagen ? (
                            <img src={p.imagen.replace('/upload/', '/upload/f_auto,q_auto,w_80/')} alt={p.nombre}
                              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid #f0ede8', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f5f4f2', border: '1px solid #e8e5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Package size={14} color="#ccc" />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{p.nombre}</span>
                              {p.destacado && <Star size={11} color="#f59e0b" fill="#f59e0b" />}
                            </div>
                            {p.codigoProducto && <span style={{ fontSize: 11, color: '#aaa' }}>{p.codigoProducto}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="col-categoria" style={{ padding: '12px 16px' }}>
                        <CategoriaPath categoria={p.categoria} categorias={categorias} />
                      </td>
                      <td className="col-precio" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#111' }}>
                        {formatPrecio(p.precio)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: stockBajo ? '#fff5f5' : '#f0fdf4',
                          color:      stockBajo ? '#ef4444' : '#16a34a',
                          border:     `1px solid ${stockBajo ? '#fecaca' : '#bbf7d0'}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {stockBajo && <AlertTriangle size={10} />}
                          {p.stock} u.
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => abrirEditar(p)} style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                            border: '1px solid #e0dbd5', borderRadius: 6, background: 'transparent',
                            cursor: 'pointer', fontSize: 12, color: '#555',
                          }}>
                            <Pencil size={11} /> Editar
                          </button>
                          <button onClick={() => setConfirmDel(p)} style={{
                            padding: '6px 10px', border: '1px solid #fecaca', borderRadius: 6,
                            background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#ef4444',
                          }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="paginacion">
            <span style={{ fontSize: 12, color: '#888' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} de {pagination.total}
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: 32, height: 32, borderRadius: 6, border: '1px solid',
                  borderColor: page === i + 1 ? '#111' : '#e0dbd5',
                  background:  page === i + 1 ? '#111' : 'transparent',
                  color:       page === i + 1 ? '#fff' : '#555',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal producto ── */}
      {modal !== null && (
        <div className="prod-modal-overlay" onClick={() => !guardando && setModal(null)}>
          <div className="prod-modal" onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {modal === 'nuevo' ? 'Nuevo producto' : `Editar: ${modal.nombre}`}
              </h2>
              <button onClick={() => !guardando && setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                <X size={20} />
              </button>
            </div>

            <div className="prod-modal-body">

              <MultipleImageUpload
                value={form.imagenes}
                onChange={(imagenes) => setForm(p => ({ ...p, imagenes, imagen: imagenes[0] ?? '' }))}
                folder="hoky/productos"
              />

              <hr style={{ border: 'none', borderTop: '1px solid #f0ede8' }} />

              {/* Información */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={secLabel}>Información</p>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: Remera básica" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                    rows={2} placeholder="Descripción opcional..." style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div className="grid-2col">
                  <div>
                    <label style={labelStyle}>Código interno</label>
                    <input value={form.codigoProducto} onChange={e => setForm(p => ({ ...p, codigoProducto: e.target.value }))}
                      placeholder="PROD-001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Código de barras</label>
                    <input value={form.codigoBarras} onChange={e => setForm(p => ({ ...p, codigoBarras: e.target.value }))}
                      placeholder="7790001234567" style={inputStyle} />
                  </div>
                </div>

                {/* ── Selects de categoría + subcategoría ── */}
                <CategoriaSelector
                  categorias={categorias}
                  value={form.categoriaId}
                  onChange={v => setForm(p => ({ ...p, categoriaId: v }))}
                  labelStyle={labelStyle}
                  inputStyle={inputStyle}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>
                  <input type="checkbox" checked={form.destacado} onChange={e => setForm(p => ({ ...p, destacado: e.target.checked }))} />
                  Producto destacado (aparece en la home)
                </label>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f0ede8' }} />

              {/* Precios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={secLabel}>Precios y stock</p>
                <div className="grid-2col">
                  <div>
                    <label style={labelStyle}>Precio tarjeta / base *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }}>$</span>
                      <input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))}
                        min="0" step="0.01" placeholder="0" style={{ ...inputStyle, paddingLeft: 22 }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Precio anterior (tachado)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }}>$</span>
                      <input type="number" value={form.precioAnterior} onChange={e => setForm(p => ({ ...p, precioAnterior: e.target.value }))}
                        min="0" step="0.01" placeholder="0" style={{ ...inputStyle, paddingLeft: 22 }} />
                    </div>
                  </div>
                </div>

                {/* Descuento efectivo */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', margin: '0 0 2px' }}>Descuento efectivo / transferencia</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>El cliente paga menos si elige estos métodos</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="number" value={form.descuentoEfectivo}
                        onChange={e => setForm(p => ({ ...p, descuentoEfectivo: e.target.value }))}
                        min="0" max="100" step="1"
                        style={{ width: 64, padding: '8px 10px', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 14, fontWeight: 700, outline: 'none', textAlign: 'center', color: '#15803d', background: '#fff' }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>%</span>
                    </div>
                  </div>
                  {form.precio && parseFloat(form.precio) > 0 && (
                    <div className="precios-preview">
                      {[
                        { label: 'Tarjeta / MP',  precio: parseFloat(form.precio) },
                        { label: 'Transferencia', precio: Math.round(parseFloat(form.precio) * (1 - (parseFloat(form.descuentoEfectivo) || 10) / 100)) },
                        { label: 'Efectivo',      precio: Math.round(parseFloat(form.precio) * (1 - (parseFloat(form.descuentoEfectivo) || 10) / 100)) },
                      ].map(({ label, precio }) => (
                        <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, color: '#888', margin: '0 0 3px' }}>{label}</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#111', margin: 0 }}>${precio.toLocaleString('es-AR')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!form.tieneVariantes && (
                  <div className="grid-3col">
                    <div>
                      <label style={labelStyle}>Stock</label>
                      <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} min="0" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Stock mínimo</label>
                      <input type="number" value={form.stockMinimo} onChange={e => setForm(p => ({ ...p, stockMinimo: e.target.value }))} min="0" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Unidad</label>
                      <input value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))} placeholder="u., kg..." style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f0ede8' }} />

              {/* Variantes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={secLabel}>Variantes</p>
                    <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Activá si tiene talle y/o color</p>
                  </div>
                  <button type="button"
                    onClick={() => {
                      setForm(p => ({ ...p, tieneVariantes: !p.tieneVariantes }));
                      if (!form.tieneVariantes && variantes.length === 0) agregarVariante();
                    }}
                    style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: form.tieneVariantes ? '#111' : '#ddd', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: form.tieneVariantes ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>

                {form.tieneVariantes && (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888', cursor: 'pointer' }}>
                      <input type="checkbox" checked={precioPorVariante} onChange={e => setPrecioPorVariante(e.target.checked)} />
                      Precio diferente por variante
                    </label>
                    <div className={`variantes-grid-header${precioPorVariante ? ' con-precio' : ''}`}
                      style={{ gridTemplateColumns: precioPorVariante ? '90px 110px 70px 100px 32px' : '90px 110px 70px 32px' }}>
                      {['Talle', 'Color', 'Stock', ...(precioPorVariante ? ['Precio'] : []), ''].map(h => (
                        <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa' }}>{h}</span>
                      ))}
                    </div>
                    {variantes.map((v, i) => (
                      <div key={i} className={`variantes-grid${precioPorVariante ? ' con-precio' : ''}`}
                        style={{ gridTemplateColumns: precioPorVariante ? '90px 110px 70px 100px 32px' : '90px 110px 70px 32px' }}>
                        <select value={v.talle} onChange={e => actualizarVariante(i, 'talle', e.target.value)} style={{ ...inputStyle, padding: '8px' }}>
                          <option value="">Sin talle</option>
                          {TALLES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input value={v.color} onChange={e => actualizarVariante(i, 'color', e.target.value)} placeholder="Rojo, Negro..." style={{ ...inputStyle, padding: '8px' }} />
                        <input type="number" value={v.stock} onChange={e => actualizarVariante(i, 'stock', e.target.value)} min="0" style={{ ...inputStyle, padding: '8px' }} />
                        {precioPorVariante && (
                          <input type="number" value={v.precio} onChange={e => actualizarVariante(i, 'precio', e.target.value)} placeholder="0" min="0" style={{ ...inputStyle, padding: '8px' }} />
                        )}
                        <button type="button" onClick={() => eliminarVariante(i)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={12} color="#ef4444" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={agregarVariante} style={{ padding: '8px', border: '1px dashed #ddd', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Plus size={12} /> Agregar variante
                      {variantes.length > 0 && <span style={{ color: '#aaa' }}>· Stock total: {stockTotalVariantes} u.</span>}
                    </button>
                  </>
                )}
              </div>

              {errorModal && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{errorModal}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid #f0ede8' }}>
              <button onClick={() => !guardando && setModal(null)} disabled={guardando} style={{ flex: 1, padding: '11px', border: '1px solid #e0dbd5', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: guardando ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {guardando && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {guardando ? 'Guardando...' : (modal === 'nuevo' ? 'Crear producto' : 'Guardar cambios')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setConfirmDel(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: 28, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff5f5', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>¿Eliminar producto?</h3>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>
              Vas a desactivar <strong>{confirmDel.nombre}</strong>. No aparecerá más en la tienda.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e0dbd5', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => eliminar(confirmDel.id)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Muestra "Padre → Hijo" en la tabla ───────────────────────────────────────
function CategoriaPath({ categoria, categorias }) {
  if (!categoria) return <span style={{ color: '#000000ff' }}>—</span>;

  // Buscar si esta categoría es hija de alguna raíz
  const padre = categorias.find(c =>
    (c.hijos ?? []).some(h => h.id === categoria.id)
  );

  if (padre) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#000000ff' }}>{padre.nombre}</span>
        <span style={{ fontSize: 11, color: '#000000ff' }}>→</span>
        <span style={{ fontSize: 12, color: '#000000ff', fontWeight: 600 }}>{categoria.nombre}</span>
      </div>
    );
  }

  return <span style={{ fontSize: 12, color: '#000000ff' }}>{categoria.nombre}</span>;
}


// ── Selector de categoría con subcategorías en cascada ───────────────────────
function CategoriaSelector({ categorias, value, onChange, labelStyle, inputStyle }) {
  // Encontrar en qué categoría raíz está el valor actual
  const catRaiz = categorias.find(c =>
    c.id === value || (c.hijos ?? []).some(h => h.id === value)
  );
  const esSubcat    = catRaiz && catRaiz.id !== value;
  const padreId     = catRaiz?.id ?? '';
  const subcats     = categorias.find(c => c.id === padreId)?.hijos ?? [];

  function handlePadre(e) {
    const id = e.target.value;
    // Al cambiar padre, seleccionar la categoría raíz directamente
    onChange(id);
  }

  function handleHijo(e) {
    onChange(e.target.value);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Select 1: Categoría raíz */}
      <div>
        <label style={labelStyle}>Categoría</label>
        <select value={padreId} onChange={handlePadre} style={inputStyle}>
          <option value="">Sin categoría</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Select 2: Subcategoría — solo aparece si la categoría raíz tiene hijos */}
      {padreId && subcats.length > 0 && (
        <div>
          <label style={labelStyle}>
            Subcategoría <span style={{ fontWeight: 400, color: '#aaa' }}>(opcional)</span>
          </label>
          <select
            value={esSubcat ? value : ''}
            onChange={handleHijo}
            style={inputStyle}
          >
            <option value="">— {categorias.find(c => c.id === padreId)?.nombre} en general —</option>
            {subcats.map(h => (
              <option key={h.id} value={h.id}>{h.nombre}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}


function thStyle(align) {
  return { padding: '12px 16px', textAlign: align, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa' };
}
const secLabel  = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', margin: 0 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', background: '#fff' };