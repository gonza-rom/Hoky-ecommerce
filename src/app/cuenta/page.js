'use client';
// src/app/cuenta/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, MapPin, Heart, LogOut, User, Package, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { id: 'pedidos',     label: 'Pedidos',      icon: ShoppingBag },
  { id: 'direcciones', label: 'Direcciones',  icon: MapPin      },
  { id: 'favoritos',   label: 'Favoritos',    icon: Heart       },
];

const ESTADOS = {
  PENDIENTE:  'Pendiente',
  CONFIRMADO: 'Confirmado',
  ENVIADO:    'Enviado',
  ENTREGADO:  'Entregado',
  CANCELADO:  'Cancelado',
};

export default function CuentaPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user,       setUser]       = useState(null);
  const [tab,        setTab]        = useState('pedidos');
  const [loading,    setLoading]    = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
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
    try {
      const res  = await fetch('/api/cuenta/pedidos');
      const data = await res.json();
      setPedidos(data.data ?? []);
    } catch {}
    try {
      const res  = await fetch('/api/cuenta/direcciones');
      const data = await res.json();
      setDirecciones(data.data ?? []);
    } catch {}
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
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={32} className="text-gray-300 animate-spin" />
    </div>
  );

  const nombre = user?.user_metadata?.nombre ?? user?.email?.split('@')[0] ?? 'Cliente';

  return (
    <div className="min-h-screen bg-[#f5f4f2]">

      {/* ── Header ── */}
      <div className="bg-[#111] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <User size={18} color="#fff" />
              </div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold truncate">Hola, {nombre}</p>
                <p className="text-[11px] md:text-xs text-white/50 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/70 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-colors hover:bg-white/20"
            >
              {loggingOut
                ? <Loader2 size={13} className="animate-spin" />
                : <LogOut size={13} />
              }
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 md:py-7">

        {/* ── Tabs móvil: horizontal scrollable ── */}
        <div className="flex md:hidden gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const activo = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border transition-all
                  ${activo
                    ? 'bg-[#111] text-white border-[#111]'
                    : 'bg-white text-gray-500 border-gray-200'
                  }`}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
          <Link
            href="/productos"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border bg-white text-gray-400 border-gray-200 no-underline"
          >
            <ShoppingBag size={13} />
            Comprar
          </Link>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── Sidebar desktop ── */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => {
                const activo = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100 text-[13px] font-medium text-left transition-all
                      ${activo ? 'bg-[#111] text-white font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
              <Link href="/productos" className="flex items-center gap-2.5 px-4 py-3.5 text-[13px] text-gray-400 no-underline hover:bg-gray-50 transition-colors">
                <ShoppingBag size={14} /> Seguir comprando
              </Link>
            </nav>
          </aside>

          {/* ── Contenido ── */}
          <div className="flex-1 min-w-0">

            {/* Pedidos */}
            {tab === 'pedidos' && (
              <div>
                <h2 className="text-lg font-extrabold tracking-tight mb-4">Mis pedidos</h2>
                {pedidos.length === 0 ? (
                  <Estado
                    icon={Package}
                    titulo="Todavía no hiciste pedidos"
                    desc="Cuando hagas tu primera compra, aparecerá acá."
                    cta={{ href: '/productos', label: 'Ver productos' }}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {pedidos.map(pedido => (
                      <div key={pedido.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[#111] mb-0.5 truncate">
                              Pedido #{pedido.numero ?? pedido.id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {new Date(pedido.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <EstadoBadge estado={pedido.estado} />
                            <p className="text-sm font-extrabold text-[#111]">
                              ${pedido.total?.toLocaleString('es-AR')}
                            </p>
                          </div>
                        </div>
                        {pedido.items?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {pedido.items.slice(0, 2).map((item, i) => (
                              <p key={i} className="text-[12px] text-gray-400 mb-0.5">
                                {item.cantidad}x {item.nombre}
                                {item.talle && ` — T: ${item.talle}`}
                                {item.color && ` — ${item.color}`}
                              </p>
                            ))}
                            {pedido.items.length > 2 && (
                              <p className="text-[12px] text-gray-300">+ {pedido.items.length - 2} más</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Direcciones */}
            {tab === 'direcciones' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-extrabold tracking-tight">Mis direcciones</h2>
                  <button className="text-xs font-semibold bg-[#111] text-white px-3 py-2 rounded-lg">
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
                  <div className="flex flex-col gap-3">
                    {direcciones.map(dir => (
                      <div key={dir.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-[13px] font-semibold text-[#111] mb-0.5">{dir.calle} {dir.numero}</p>
                        <p className="text-[12px] text-gray-400">{dir.ciudad}, {dir.provincia} — CP {dir.codigoPostal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favoritos */}
            {tab === 'favoritos' && (
              <div>
                <h2 className="text-lg font-extrabold tracking-tight mb-4">Mis favoritos</h2>
                {favoritos.length === 0 ? (
                  <Estado
                    icon={Heart}
                    titulo="No tenés favoritos guardados"
                    desc="Guardá los productos que te gustan para encontrarlos fácilmente."
                    cta={{ href: '/productos', label: 'Explorar productos' }}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {favoritos.map(p => (
                      <Link key={p.id} href={`/productos/${p.id}`} className="no-underline">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          {p.imagen && (
                            <img src={p.imagen} alt={p.nombre} className="w-full aspect-[3/4] object-cover" />
                          )}
                          <div className="p-3">
                            <p className="text-[11px] font-semibold text-[#111] uppercase truncate mb-1">{p.nombre}</p>
                            <p className="text-[13px] font-bold text-[#111]">${p.precio?.toLocaleString('es-AR')}</p>
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
    </div>
  );
}

// ── Estado vacío ──────────────────────────────────────────────
function Estado({ icon: Icon, titulo, desc, cta }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
      <Icon size={36} className="text-gray-200 mx-auto mb-3" />
      <p className="text-sm font-bold text-gray-600 mb-1">{titulo}</p>
      <p className="text-xs text-gray-400 mb-5">{desc}</p>
      {cta && (
        <Link href={cta.href} className="inline-block bg-[#111] text-white px-5 py-2.5 rounded-lg text-xs font-semibold no-underline">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

// ── Badge de estado ───────────────────────────────────────────
function EstadoBadge({ estado }) {
  const map = {
    ENTREGADO: 'bg-green-50 text-green-700 border-green-200',
    CANCELADO: 'bg-red-50 text-red-500 border-red-200',
  };
  const cls = map[estado] ?? 'bg-gray-50 text-gray-400 border-gray-200';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${cls}`}>
      {ESTADOS[estado] ?? estado}
    </span>
  );
}