'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';

export default function ProductCard({ producto, onAddToCart }) {
  // Obtener la imagen principal del producto
  const getImagenPrincipal = () => {
    // Prioridad: usar el primer elemento de imagenes[], luego imagen, luego null
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes[0];
    }
    return producto.imagen || null;
  };

  const imagenPrincipal = getImagenPrincipal();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      <Link href={`/productos/${producto.id}`} className="block">
        <div className="relative h-48 bg-gray-100">
          {imagenPrincipal ? (
            <Image
              src={imagenPrincipal}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Badge de múltiples imágenes */}
          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {producto.imagenes.length}
            </div>
          )}
          
          {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
              ¡Últimas unidades!
            </div>
          )}
          
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                Sin Stock
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg">
              <Eye className="w-4 h-4" />
              Ver Detalles
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] hover:text-jmr-green transition-colors">
            {producto.nombre}
          </h3>
        </Link>
        
        {producto.categoria && (
          <Link 
            href={`/productos?categoria=${producto.categoriaId}`}
            className="text-xs text-gray-500 hover:text-jmr-green mb-2 inline-block"
          >
            {producto.categoria.nombre}
          </Link>
        )}
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mt-3">
            <p className="text-xl font-bold text-jmr-green">
              ${producto.precio.toFixed(2)}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(producto, 1);
              }}
              disabled={producto.stock === 0}
              className="bg-jmr-green hover:bg-jmr-green-dark text-white p-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              title={producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}