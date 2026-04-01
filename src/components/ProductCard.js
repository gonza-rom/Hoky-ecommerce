'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { getImagenesValidas } from './ProductGallery';

export default function ProductCard({ producto, onAddToCart }) {
  const images = getImagenesValidas(producto);
  const imagenPrincipal = images[0] || null;

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

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
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

        <div className="mt-auto flex items-center justify-between">
          <p className="text-base font-bold text-hoky-black">
            ${producto.precio.toFixed(2)}
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
  );
}