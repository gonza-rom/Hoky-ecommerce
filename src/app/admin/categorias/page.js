'use client';
// src/app/admin/categorias/page.js

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Tag, Loader2 } from 'lucide-react';

export default function AdminCategoriasPage() {
  const [categorias,  setCategorias]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null); // null | 'nuevo' | categoria
  const [form,        setForm]        = useState({ nombre: '', descripcion: '', orden: 0 });
  const [guardando,   setGuardando]   = useState(false);
  const [error,       setError]       = useState('');
  const [confirmDel,  setConfirmDel]  = useState(null);

  useEffect(() => { fetchCategorias(); }, []);

  async function fetchCategorias() {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/categorias');
      const data = await res.json();
      setCategorias(data.data ?? []);
    } catch { setCategorias([]); }
    finally  { setLoading(false); }
  }

  function abrirNuevo() {
    setForm({ nombre: '', descripcion: '', orden: 0 });
    setError('');
    setModal('nuevo');
  }

  function abrirEditar(cat) {
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? '', orden: cat.orden ?? 0 });
    setError('');
    setModal(cat);
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return; }
    setGuardando(true); setError('');
    try {
      const esEdicion = modal !== 'nuevo';
      const res = await fetch(
        esEdicion ? `/api/admin/categorias/${modal.id}` : '/api/admin/categorias',
        {
          method:  esEdicion ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? 'Error al guardar'); return; }
      setModal(null);
      fetchCategorias();
    } catch { setError('Error de conexión'); }
    finally  { setGuardando(false); }
  }

  async function eliminar(id) {
    try {
      await fetch(`/api/admin/categorias/${id}`, { method: 'DELETE' });
      setConfirmDel(null);
      fetchCategorias();
    } catch { alert('Error al eliminar'); }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Categorías</h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{categorias.length} categorías en total</p>
        </div>
        <button onClick={abrirNuevo} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#111', color: '#fff', border: 'none',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}>
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      {/* Lista */}
      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : categorias.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Tag size={40} color="#ddd" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>No hay categorías. Creá la primera.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede8' }}>
                {['Nombre', 'Descripción', 'Productos', 'Orden', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#aaa',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat, i) => (
                <tr key={cat.id} style={{ borderBottom: i < categorias.length - 1 ? '1px solid #f7f4f0' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111' }}>{cat.nombre}</td>
                  <td style={{ padding: '14px 16px', color: '#888' }}>{cat.descripcion || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#888' }}>{cat._count?.productos ?? 0} productos</td>
                  <td style={{ padding: '14px 16px', color: '#888' }}>{cat.orden}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => abrirEditar(cat)} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', border: '1px solid #e0dbd5',
                        borderRadius: 6, background: 'transparent', cursor: 'pointer',
                        fontSize: 12, color: '#555',
                      }}>
                        <Pencil size={12} /> Editar
                      </button>
                      <button onClick={() => setConfirmDel(cat)} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', border: '1px solid #fecaca',
                        borderRadius: 6, background: 'transparent', cursor: 'pointer',
                        fontSize: 12, color: '#ef4444',
                      }}>
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal crear/editar ── */}
      {modal !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          background: 'rgba(0,0,0,0.6)',
        }} onClick={() => !guardando && setModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {modal === 'nuevo' ? 'Nueva categoría' : `Editar: ${modal.nombre}`}
              </h2>
              <button onClick={() => !guardando && setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                  Nombre *
                </label>
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Remeras"
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5',
                    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={3}
                  placeholder="Descripción opcional..."
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5',
                    borderRadius: 8, fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                  Orden en el menú
                </label>
                <input
                  type="number"
                  value={form.orden}
                  onChange={e => setForm(p => ({ ...p, orden: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: 100, padding: '10px 12px', border: '1px solid #e0dbd5',
                    borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
                <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Número menor = aparece primero</p>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>
              )}
            </div>

            {/* Footer modal */}
            <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid #f0ede8' }}>
              <button onClick={() => !guardando && setModal(null)} disabled={guardando} style={{
                flex: 1, padding: '10px', border: '1px solid #e0dbd5', borderRadius: 8,
                background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555',
              }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                background: '#111', color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', opacity: guardando ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {guardando && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar ── */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          background: 'rgba(0,0,0,0.6)',
        }} onClick={() => setConfirmDel(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: 28,
            textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#fff5f5',
              border: '1px solid #fecaca', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>¿Eliminar categoría?</h3>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>
              Vas a eliminar <strong>{confirmDel.nombre}</strong>. Los productos quedarán sin categoría.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{
                flex: 1, padding: '10px', border: '1px solid #e0dbd5', borderRadius: 8,
                background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={() => eliminar(confirmDel.id)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}