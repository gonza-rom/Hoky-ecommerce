'use client';
// src/components/ProductCard.js

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { getImagenesValidas } from './ProductGallery';

export default function ProductCard({ producto, onAddToCart }) {
  const images          = getImagenesValidas(producto);
  const imagenPrincipal = images[0] || null;

  // Precio con descuento (efectivo / transferencia)
  const descuento       = producto.descuentoEfectivo ?? 10;
  const precioEfectivo  = Math.round(producto.precio * (1 - descuento / 100));

  // Colores únicos de variantes activas con stock
  const coloresUnicos = producto.variantes
    ? [...new Set(
        producto.variantes
          .filter(v => v.stock > 0)
          .map(v => v.color)
          .filter(Boolean)
      )]
    : [];

  // Talles únicos con stock
  const tallesUnicos = producto.variantes
    ? [...new Set(
        producto.variantes
          .filter(v => v.stock > 0)
          .map(v => v.talle)
          .filter(Boolean)
      )]
    : [];

  return (
    <div className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group border border-gray-100 hover:border-gray-300 rounded-sm product-card">
      <Link href={`/productos/${producto.id}`} className="block">
        <div className="relative bg-hoky-sand3 aspect-[3/4]">
          {imagenPrincipal ? (
            <Image
              src={imagenPrincipal}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Badge múltiples fotos */}
          {images.length > 1 && (
            <div className="absolute top-2 left-2 bg-hoky-black/80 text-white text-[10px] px-2 py-0.5 tracking-wider uppercase">
              {images.length} fotos
            </div>
          )}

          {/* Pocas unidades */}
          {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
            <div className="absolute top-2 right-2 bg-white text-hoky-black text-[10px] px-2 py-0.5 font-semibold tracking-wider uppercase border border-hoky-black">
              Últimas
            </div>
          )}

          {/* Sin stock */}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-hoky-black px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                Sin Stock
              </span>
            </div>
          )}

          {/* Hover overlay con talles disponibles */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex flex-col items-center justify-end pb-3 gap-2 opacity-0 group-hover:opacity-100">
            {tallesUnicos.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center px-2">
                {tallesUnicos.map(talle => (
                  <span key={talle} style={{
                    background: 'rgba(255,255,255,0.92)',
                    color: '#111',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 5px',
                    letterSpacing: '0.05em',
                  }}>
                    {talle}
                  </span>
                ))}
              </div>
            )}
            <span className="bg-white text-hoky-black px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              Ver producto
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {producto.categoria && (
          <span className="text-[10px] text-gray-400 font-medium tracking-[0.1em] uppercase mb-1">
            {producto.categoria.nombre}
          </span>
        )}

        <Link href={`/productos/${producto.id}`}>
          <h3 className="text-sm font-semibold text-hoky-black mb-2 line-clamp-2 leading-snug hover:opacity-60 transition-opacity tracking-wide uppercase">
            {producto.nombre}
          </h3>
        </Link>

        {/* Dots de colores */}
        {coloresUnicos.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {coloresUnicos.slice(0, 6).map(color => (
              <ColorDot key={color} color={color} />
            ))}
            {coloresUnicos.length > 6 && (
              <span style={{ fontSize: 10, color: '#aaa', alignSelf: 'center' }}>
                +{coloresUnicos.length - 6}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto">
          {/* Precio tarjeta tachado + precio efectivo principal */}
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <p className="text-base font-bold text-hoky-black">
              ${precioEfectivo.toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: 15, color: '#aaa', textDecoration: 'line-through' }}>
              ${producto.precio.toLocaleString('es-AR')}
            </p>
          </div>

          {/* Etiqueta método de pago */}
          <p style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>
            💵 Ef. / transferencia · {descuento}% OFF
          </p>

          {/* Precio anterior (oferta) si existe */}
          {producto.precioAnterior && producto.precioAnterior > producto.precio && (
            <p style={{ fontSize: 10, color: '#aaa', textDecoration: 'line-through', marginBottom: 4 }}>
              Antes: ${producto.precioAnterior.toLocaleString('es-AR')}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p style={{ fontSize: 13, color: '#888' }}>
              💳 Tarjeta: ${producto.precio.toLocaleString('es-AR')}
            </p>
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(producto, 1); }}
              disabled={producto.stock === 0}
              className="bg-hoky-black hover:bg-hoky-dark text-white p-2 rounded-none transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              title={producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dot de color ──────────────────────────────────────────────
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
  beige:    '#d4cfc9',
  celeste:  '#7dd3fc',
  bordo:    '#9f1239', burdeos:  '#9f1239',
  camel:    '#c8a26b',
};

function ColorDot({ color }) {
  const hex = COLOR_MAP[color?.toLowerCase()] ?? null;
  return (
    <div
      title={color}
      style={{
        width:  14, height: 14, borderRadius: '50%',
        background: hex ?? '#e5e5e5',
        border: hex === '#ffffff' || hex === null ? '1px solid #ddd' : '1px solid transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 7, fontWeight: 700, color: '#888',
      }}
    >
      {!hex && color?.slice(0, 1).toUpperCase()}
    </div>
  );
}