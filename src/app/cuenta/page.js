'use client';
// src/app/cuenta/page.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, MapPin, Heart, LogOut, User, ChevronRight, Package, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { id: 'pedidos',     label: 'Mis pedidos',    icon: ShoppingBag },
  { id: 'direcciones', label: 'Direcciones',     icon: MapPin      },
  { id: 'favoritos',   label: 'Favoritos',       icon: Heart       },
];

export default function CuentaPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user,       setUser]       = useState(null);
  const [tab,        setTab]        = useState('pedidos');
  const [loading,    setLoading]    = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Datos
  const [pedidos,     setPedidos]     = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [favoritos,   setFavoritos]   = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      setLoading(false);
      fetchDatos(user.id);
    });
  }, []);

  async function fetchDatos(userId) {
    // Pedidos
    try {
      const res  = await fetch('/api/cuenta/pedidos');
      const data = await res.json();
      setPedidos(data.data ?? []);
    } catch {}

    // Direcciones
    try {
      const res  = await fetch('/api/cuenta/direcciones');
      const data = await res.json();
      setDirecciones(data.data ?? []);
    } catch {}

    // Favoritos (localStorage)
    try {
      const favs = JSON.parse(localStorage.getItem('hoky-favoritos') ?? '[]');
      if (favs.length > 0) {
        const res  = await fetch(`/api/productos?ids=${favs.join(',')}`);
        const data = await res.json();
        setFavoritos(data.productos ?? []);
      }
    } catch {}
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const nombre = user?.user_metadata?.nombre ?? user?.email?.split('@')[0] ?? 'Cliente';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f2', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#111', color: '#fff', padding: '32px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={20} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Hola, {nombre}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} disabled={loggingOut} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', padding: '8px 14px', borderRadius: 8,
              fontSize: 13, cursor: 'pointer',
            }}>
              {loggingOut ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <LogOut size={14} />}
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Sidebar tabs */}
          <aside style={{ width: 200, flexShrink: 0 }}>
            <nav style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e5e0', overflow: 'hidden' }}>
              {TABS.map(({ id, label, icon: Icon }) => {
                const activo = tab === id;
                return (
                  <button key={id} onClick={() => setTab(id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', border: 'none', borderBottom: '1px solid #f0ede8',
                    background: activo ? '#111' : '#fff',
                    color: activo ? '#fff' : '#555',
                    fontSize: 13, fontWeight: activo ? 700 : 500,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}>
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
              <Link href="/productos" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 16px', fontSize: 13, color: '#888',
                textDecoration: 'none',
              }}>
                <ShoppingBag size={15} /> Seguir comprando
              </Link>
            </nav>
          </aside>

          {/* Contenido */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── Pedidos ── */}
            {tab === 'pedidos' && (
              <div>
                <h2 style={tituloStyle}>Mis pedidos</h2>
                {pedidos.length === 0 ? (
                  <Estado
                    icon={Package}
                    titulo="Todavía no hiciste pedidos"
                    desc="Cuando hagas tu primera compra, aparecerá acá."
                    cta={{ href: '/productos', label: 'Ver productos' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pedidos.map(pedido => (
                      <div key={pedido.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: '#111' }}>
                              Pedido #{pedido.numero ?? pedido.id.slice(-6).toUpperCase()}
                            </p>
                            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                              {new Date(pedido.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                              background: pedido.estado === 'ENTREGADO' ? '#f0fdf4' : pedido.estado === 'CANCELADO' ? '#fff5f5' : '#fafaf8',
                              color:      pedido.estado === 'ENTREGADO' ? '#16a34a' : pedido.estado === 'CANCELADO' ? '#ef4444' : '#888',
                              border:     `1px solid ${pedido.estado === 'ENTREGADO' ? '#bbf7d0' : pedido.estado === 'CANCELADO' ? '#fecaca' : '#e8e5e0'}`,
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              {ESTADOS[pedido.estado] ?? pedido.estado}
                            </span>
                            <p style={{ fontSize: 14, fontWeight: 800, color: '#111', margin: 0 }}>
                              ${pedido.total?.toLocaleString('es-AR')}
                            </p>
                          </div>
                        </div>
                        {pedido.items?.length > 0 && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0ede8' }}>
                            {pedido.items.slice(0, 2).map((item, i) => (
                              <p key={i} style={{ fontSize: 12, color: '#888', margin: '2px 0' }}>
                                {item.cantidad}x {item.nombre}
                                {item.talle  && ` — T: ${item.talle}`}
                                {item.color  && ` — ${item.color}`}
                              </p>
                            ))}
                            {pedido.items.length > 2 && (
                              <p style={{ fontSize: 12, color: '#bbb', margin: '2px 0' }}>
                                + {pedido.items.length - 2} productos más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Direcciones ── */}
            {tab === 'direcciones' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={tituloStyle}>Mis direcciones</h2>
                  <button style={{
                    fontSize: 13, fontWeight: 600, background: '#111', color: '#fff',
                    border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                  }}>
                    + Agregar
                  </button>
                </div>
                {direcciones.length === 0 ? (
                  <Estado
                    icon={MapPin}
                    titulo="No tenés direcciones guardadas"
                    desc="Guardá tus direcciones para comprar más rápido."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {direcciones.map(dir => (
                      <div key={dir.id} style={cardStyle}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: '#111' }}>{dir.calle} {dir.numero}</p>
                        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{dir.ciudad}, {dir.provincia} — CP {dir.codigoPostal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Favoritos ── */}
            {tab === 'favoritos' && (
              <div>
                <h2 style={tituloStyle}>Mis favoritos</h2>
                {favoritos.length === 0 ? (
                  <Estado
                    icon={Heart}
                    titulo="No tenés favoritos guardados"
                    desc="Guardá los productos que te gustan para encontrarlos fácilmente."
                    cta={{ href: '/productos', label: 'Explorar productos' }}
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {favoritos.map(p => (
                      <Link key={p.id} href={`/productos/${p.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 10, overflow: 'hidden' }}>
                          {p.imagen && (
                            <img src={p.imagen} alt={p.nombre} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                          )}
                          <div style={{ padding: '10px 12px' }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: '0 0 4px', textTransform: 'uppercase' }}>{p.nombre}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>${p.precio?.toLocaleString('es-AR')}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Estado vacío ──────────────────────────────────────────────
function Estado({ icon: Icon, titulo, desc, cta }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
      <Icon size={40} color="#ddd" style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 700, color: '#333', margin: '0 0 6px' }}>{titulo}</p>
      <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 20px' }}>{desc}</p>
      {cta && (
        <Link href={cta.href} style={{
          display: 'inline-block', background: '#111', color: '#fff',
          padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

const ESTADOS = {
  PENDIENTE:  'Pendiente',
  CONFIRMADO: 'Confirmado',
  ENVIADO:    'Enviado',
  ENTREGADO:  'Entregado',
  CANCELADO:  'Cancelado',
};

const tituloStyle = { fontSize: 18, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.01em' };
const cardStyle   = { background: '#fff', border: '1px solid #e8e5e0', borderRadius: 10, padding: '14px 16px' };