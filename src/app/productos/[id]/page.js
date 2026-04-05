'use client';
// src/app/productos/[id]/page.js

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Package, Truck, Shield, Star, Plus, Minus, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' } }),
};
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// ── Mapa de colores ───────────────────────────────────────────
const COLOR_MAP = {
  negro:    '#111111', black:    '#111111',
  blanco:   '#ffffff', white:    '#ffffff',
  rojo:     '#ef4444', red:      '#ef4444',
  azul:     '#3b82f6', blue:     '#3b82f6',
  verde:    '#22c55e', green:    '#22c55e',
  amarillo: '#eab308', yellow:   '#eab308',
  naranja:  '#f97316', orange:   '#f97316',
  rosa:     '#ec4899', pink:     '#ec4899',
  violeta:  '#8b5cf6', purple:   '#8b5cf6',
  gris:     '#9ca3af', grey:     '#9ca3af', gray: '#9ca3af',
  marron:   '#92400e', marrón:   '#92400e', brown: '#92400e',
  beige:    '#d4cfc9', celeste:  '#7dd3fc',
  bordo:    '#9f1239', burdeos:  '#9f1239',
  camel:    '#c8a26b',
};

export default function ProductoDetallePage() {
  const params  = useParams();
  const router  = useRouter();

  const [producto,              setProducto]              = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loading,               setLoading]               = useState(true);
  const [error,                 setError]                 = useState(null);
  const [cantidad,              setCantidad]              = useState(1);
  const [agregado,              setAgregado]              = useState(false);

  // Variantes
  const [talleSeleccionado,  setTalleSeleccionado]  = useState('');
  const [colorSeleccionado,  setColorSeleccionado]  = useState('');
  const [errorVariante,      setErrorVariante]      = useState('');

  const { addToCart } = useCart();

  useEffect(() => { if (params.id) fetchProducto(); }, [params.id]);

  const fetchProducto = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/productos/${params.id}`);
      if (!res.ok) { setError(res.status === 404 ? 'not_found' : 'error'); return; }
      const data = await res.json();
      setProducto(data);
      fetchRelacionados(data.categoriaId, data.id);
    } catch { setError('error'); }
    finally  { setLoading(false); }
  };

  const fetchRelacionados = async (categoriaId, productoId) => {
    try {
      const res  = await fetch(`/api/productos?categoria=${categoriaId}&exclude=${productoId}&limit=4`);
      const data = await res.json();
      setProductosRelacionados(Array.isArray(data) ? data : data.productos ?? []);
    } catch {}
  };

  // ── Lógica de variantes ───────────────────────────────────
  const variantes = producto?.variantes ?? [];
  const tieneVariantes = producto?.tieneVariantes && variantes.length > 0;

  // Talles disponibles (con stock en algún color)
  const tallesDisponibles = useMemo(() => {
    if (!tieneVariantes) return [];
    return [...new Set(variantes.filter(v => v.stock > 0).map(v => v.talle).filter(Boolean))];
  }, [variantes, tieneVariantes]);

  // Colores disponibles según el talle seleccionado
  const coloresDisponibles = useMemo(() => {
    if (!tieneVariantes) return [];
    const base = talleSeleccionado
      ? variantes.filter(v => v.talle === talleSeleccionado && v.stock > 0)
      : variantes.filter(v => v.stock > 0);
    return [...new Set(base.map(v => v.color).filter(Boolean))];
  }, [variantes, tieneVariantes, talleSeleccionado]);

  // Variante seleccionada
  const varianteSeleccionada = useMemo(() => {
    if (!tieneVariantes) return null;
    return variantes.find(v =>
      (!talleSeleccionado || v.talle === talleSeleccionado) &&
      (!colorSeleccionado || v.color === colorSeleccionado)
    ) ?? null;
  }, [variantes, tieneVariantes, talleSeleccionado, colorSeleccionado]);

  // Stock efectivo
  const stockEfectivo = tieneVariantes
    ? (varianteSeleccionada?.stock ?? 0)
    : (producto?.stock ?? 0);

  // Precio efectivo (variante puede tener precio propio)
  const precioEfectivo = varianteSeleccionada?.precio ?? producto?.precio ?? 0;

  // Reset color cuando cambia talle
  const handleTalle = (talle) => {
    setTalleSeleccionado(prev => prev === talle ? '' : talle);
    setColorSeleccionado('');
    setErrorVariante('');
  };

  const handleColor = (color) => {
    setColorSeleccionado(prev => prev === color ? '' : color);
    setErrorVariante('');
  };

  // ── Agregar al carrito ────────────────────────────────────
  const handleAgregarCarrito = () => {
    if (!producto) return;

    if (tieneVariantes) {
      if (tallesDisponibles.length > 0 && !talleSeleccionado) {
        setErrorVariante('Seleccioná un talle'); return;
      }
      if (coloresDisponibles.length > 0 && !colorSeleccionado) {
        setErrorVariante('Seleccioná un color'); return;
      }
      if (!varianteSeleccionada || varianteSeleccionada.stock === 0) {
        setErrorVariante('Combinación sin stock'); return;
      }
    }

    const item = {
      ...producto,
      precio:     precioEfectivo,
      varianteId: varianteSeleccionada?.id ?? null,
      talle:      talleSeleccionado  || null,
      color:      colorSeleccionado  || null,
      // clave única para el carrito cuando hay variantes
      id: varianteSeleccionada ? `${producto.id}-${varianteSeleccionada.id}` : producto.id,
    };
    addToCart(item, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!producto) return;
    const varInfo = [talleSeleccionado && `Talle: ${talleSeleccionado}`, colorSeleccionado && `Color: ${colorSeleccionado}`].filter(Boolean).join(' | ');
    const msg =
      `¡Hola! Me interesa este producto:\n\n` +
      `*${producto.nombre}*${varInfo ? `\n${varInfo}` : ''}\n` +
      `Cantidad: ${cantidad}\n` +
      `Precio: $${precioEfectivo.toFixed(2)}\n\n¿Está disponible?`;
    window.open(`https://wa.me/543834644467?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCompartir = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: producto.nombre, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); alert('¡Enlace copiado!'); } catch {} }
  };

  // ── Loading / Error ───────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hoky-black mx-auto mb-4" />
        <p className="text-gray-600">Cargando producto...</p>
      </div>
    </div>
  );

  if (error || !producto) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md text-center bg-white rounded-lg shadow-md p-8">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error === 'not_found' ? 'Producto no encontrado' : 'Error al cargar'}
        </h2>
        <Link href="/productos" className="inline-flex items-center gap-2 bg-hoky-black text-white px-6 py-3 rounded-lg font-semibold mt-4">
          <ArrowLeft className="w-5 h-5" /> Ver Productos
        </Link>
      </div>
    </div>
  );

  const WhatsAppIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <motion.div className="bg-white border-b" initial="hidden" animate="visible" variants={fadeIn}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-400 hover:text-hoky-black transition-colors">Inicio</Link>
            <span className="text-gray-300">/</span>
            <Link href="/productos" className="text-gray-400 hover:text-hoky-black transition-colors">Productos</Link>
            {producto.categoria && <>
              <span className="text-gray-300">/</span>
              <Link href={`/productos?categoria=${producto.categoriaId}`} className="text-gray-400 hover:text-hoky-black transition-colors">
                {producto.categoria.nombre}
              </Link>
            </>}
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{producto.nombre}</span>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        <motion.button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-hoky-black mb-6 transition-colors text-sm"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <ArrowLeft className="w-4 h-4" /> Volver
        </motion.button>

        {/* ── Grid principal ── */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">

          {/* Galería */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <ProductGallery producto={producto} />
            <button onClick={handleCompartir}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
              <Share2 className="w-4 h-4" /> Compartir
            </button>
          </motion.div>

          {/* Info */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 lg:sticky lg:top-24">

              {/* Categoría */}
              {producto.categoria && (
                <Link href={`/productos?categoria=${producto.categoriaId}`}
                  className="inline-block text-xs text-gray-400 font-semibold mb-2 hover:text-hoky-black tracking-widest uppercase">
                  {producto.categoria.nombre}
                </Link>
              )}

              {/* Nombre */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight tracking-tight uppercase">
                {producto.nombre}
              </h1>

              {/* Precio */}
              <div className="mb-5 pb-5 border-b flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-hoky-black">
                  ${precioEfectivo.toLocaleString('es-AR')}
                </span>
                {producto.precioAnterior && producto.precioAnterior > precioEfectivo && (
                  <span className="text-lg text-gray-400 line-through">
                    ${producto.precioAnterior.toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <p className="text-gray-600 text-sm leading-relaxed mb-5 pb-5 border-b">
                  {producto.descripcion}
                </p>
              )}

              {/* ── Selector de TALLES ── */}
              {tallesDisponibles.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-700 tracking-widest uppercase text-gray-500 mb-2 font-semibold">
                    Talle{talleSeleccionado && <span className="ml-2 text-hoky-black normal-case font-bold">{talleSeleccionado}</span>}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {tallesDisponibles.map(talle => {
                      const activo = talleSeleccionado === talle;
                      return (
                        <button key={talle} onClick={() => handleTalle(talle)} style={{
                          minWidth: 40, height: 36, padding: '0 10px',
                          border:      activo ? '2px solid #111' : '1px solid #e0dbd5',
                          background:  activo ? '#111' : '#fff',
                          color:       activo ? '#fff' : '#555',
                          fontSize: 12, fontWeight: 700,
                          letterSpacing: '0.06em',
                          cursor: 'pointer', transition: 'all 0.15s',
                          borderRadius: 4,
                        }}>
                          {talle}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Selector de COLORES ── */}
              {coloresDisponibles.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                    Color{colorSeleccionado && <span className="ml-2 text-hoky-black normal-case font-bold capitalize">{colorSeleccionado}</span>}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {coloresDisponibles.map(color => {
                      const hex    = COLOR_MAP[color?.toLowerCase()] ?? null;
                      const activo = colorSeleccionado === color;
                      return (
                        <button key={color} onClick={() => handleColor(color)} title={color} style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background:  hex ?? '#e5e5e5',
                          border:      activo
                            ? '3px solid #111'
                            : hex === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                          cursor: 'pointer',
                          outline: activo ? '2px solid white' : 'none',
                          outlineOffset: '-4px',
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 8, fontWeight: 700, color: '#888',
                        }}>
                          {!hex && color?.slice(0, 1).toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error variante */}
              {errorVariante && (
                <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{errorVariante}</p>
              )}

              {/* Stock */}
              <div className="mb-5 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className={`text-sm font-medium ${stockEfectivo > 0 ? 'text-green-700' : 'text-red-500'}`}>
                  {tieneVariantes && (!talleSeleccionado && !colorSeleccionado)
                    ? 'Seleccioná talle/color para ver stock'
                    : stockEfectivo > 0
                      ? `${stockEfectivo} unidades disponibles`
                      : 'Sin stock para esta combinación'
                  }
                </span>
              </div>

              {/* Cantidad */}
              {stockEfectivo > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Cantidad</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="p-2.5 hover:bg-gray-50 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-sm">{cantidad}</span>
                      <button onClick={() => setCantidad(Math.min(stockEfectivo, cantidad + 1))}
                        className="p-2.5 hover:bg-gray-50 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-500 text-sm">
                      Total: <strong className="text-hoky-black">${(precioEfectivo * cantidad).toLocaleString('es-AR')}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="space-y-2">
                {stockEfectivo > 0 ? (
                  <>
                    <motion.button onClick={handleAgregarCarrito} whileTap={{ scale: 0.98 }}
                      className={`w-full py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-base shadow-sm ${
                        agregado ? 'bg-green-600 text-white' : 'bg-hoky-black hover:bg-hoky-dark text-white'
                      }`}>
                      <ShoppingBag className="w-5 h-5" />
                      <AnimatePresence mode="wait">
                        <motion.span key={agregado ? 'ok' : 'add'}
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                          {agregado ? '¡Agregado!' : 'Agregar al carrito'}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                    <motion.button onClick={handleWhatsApp} whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-base">
                      <WhatsAppIcon /> Consultar por WhatsApp
                    </motion.button>
                  </>
                ) : (
                  <motion.button onClick={handleWhatsApp} whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <WhatsAppIcon /> Consultar disponibilidad
                  </motion.button>
                )}
              </div>

              {/* Garantías */}
              <div className="mt-6 pt-5 border-t space-y-2">
                {[
                  { icon: Shield, text: 'Productos de calidad garantizada' },
                  { icon: Truck,  text: 'Retiro en local — Esquiú 620, Catamarca' },
                  { icon: Star,   text: 'Atención personalizada' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-xs text-gray-500">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Productos relacionados */}
        {productosRelacionados.length > 0 && (
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">También te puede gustar</h2>
              {producto.categoria && (
                <Link href={`/productos?categoria=${producto.categoriaId}`}
                  className="text-sm text-gray-400 hover:text-hoky-black font-medium">
                  Ver todos →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productosRelacionados.map((p, i) => (
                <motion.div key={p.id} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <ProductCard producto={p} onAddToCart={addToCart} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}