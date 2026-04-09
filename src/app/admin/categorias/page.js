'use client';
// src/app/admin/categorias/page.js

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Tag, Loader2, ChevronRight, FolderOpen } from 'lucide-react';

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({ nombre: '', descripcion: '', orden: 0, parentId: '' });
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

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

  function abrirNuevo(parentId = '') {
    setForm({ nombre: '', descripcion: '', orden: 0, parentId });
    setError('');
    setModal('nuevo');
  }

  function abrirEditar(cat, parentId = '') {
    setForm({
      nombre:      cat.nombre,
      descripcion: cat.descripcion ?? '',
      orden:       cat.orden ?? 0,
      parentId:    cat.parentId ?? parentId ?? '',
    });
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
          body:    JSON.stringify({
            ...form,
            parentId: form.parentId || null,
          }),
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

  // Lista plana de todas las categorías para el select de padre
  const todasLasCats = categorias.flatMap(c => [c, ...(c.hijos ?? [])]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Categorías</h1>
          <p className="text-sm text-gray-400">
            {categorias.length} categorías · {categorias.reduce((a, c) => a + (c.hijos?.length ?? 0), 0)} subcategorías
          </p>
        </div>
        <button onClick={() => abrirNuevo()}
          className="flex items-center gap-2 bg-[#111] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex-shrink-0 hover:bg-gray-800 transition-colors">
          <Plus size={14} /> <span className="hidden sm:inline">Nueva categoría</span><span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Loader2 size={28} className="text-gray-300 animate-spin mx-auto" />
          </div>
        ) : categorias.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Tag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No hay categorías. Creá la primera.</p>
          </div>
        ) : (
          categorias.map(cat => (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">

              {/* Categoría raíz */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FolderOpen size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-[#111]">{cat.nombre}</p>
                    <span className="text-[11px] text-gray-400">
                      {cat._count?.productos ?? 0} productos
                      {cat.hijos?.length > 0 && ` · ${cat.hijos.length} subcategorías`}
                    </span>
                  </div>
                  {cat.descripcion && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{cat.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => abrirNuevo(cat.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <Plus size={11} /> Sub
                  </button>
                  <button onClick={() => abrirEditar(cat)}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDel(cat)}
                    className="p-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Subcategorías */}
              {cat.hijos?.length > 0 && (
                <div className="border-t border-gray-100">
                  {cat.hijos.map((hijo, i) => (
                    <div key={hijo.id}
                      className={`flex items-center gap-3 px-4 py-3 bg-gray-50 ${i < cat.hijos.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="flex items-center gap-2 pl-4 flex-shrink-0">
                        <ChevronRight size={12} className="text-gray-300" />
                        <Tag size={13} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-gray-700 font-medium">{hijo.nombre}</p>
                          <span className="text-[11px] text-gray-400">{hijo._count?.productos ?? 0} productos</span>
                        </div>
                        {hijo.descripcion && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{hijo.descripcion}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => abrirEditar({ ...hijo, parentId: cat.id })}
                          className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setConfirmDel(hijo)}
                          className="p-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Modal crear/editar ── */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => !guardando && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold">
                {modal === 'nuevo'
                  ? form.parentId ? 'Nueva subcategoría' : 'Nueva categoría'
                  : `Editar: ${modal.nombre}`
                }
              </h2>
              <button onClick={() => !guardando && setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre *</label>
                <input autoFocus value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Remeras"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={2} placeholder="Descripción opcional..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-gray-400" />
              </div>

              {/* Categoría padre */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Categoría padre <span className="font-normal text-gray-400">(opcional — si es subcategoría)</span>
                </label>
                <select value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white">
                  <option value="">— Categoría raíz —</option>
                  {categorias
                    .filter(c => modal === 'nuevo' || c.id !== modal.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Orden en el menú</label>
                <input type="number" value={form.orden}
                  onChange={e => setForm(p => ({ ...p, orden: parseInt(e.target.value) || 0 }))}
                  className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400" />
                <p className="text-[11px] text-gray-400 mt-1">Número menor = aparece primero</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={() => !guardando && setModal(null)} disabled={guardando}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 py-2.5 bg-[#111] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-gray-800 transition-colors">
                {guardando && <Loader2 size={13} className="animate-spin" />}
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold mb-2">¿Eliminar categoría?</h3>
            <p className="text-sm text-gray-400 mb-1">
              Vas a eliminar <strong>{confirmDel.nombre}</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Los productos quedarán sin categoría y las subcategorías pasarán a ser raíz.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmDel.id)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}