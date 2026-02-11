'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { getCloudinaryUrl, CLOUDINARY_SIZES } from '@/lib/cloudinary';

export default function ProductGallery({ producto }) {
  // Obtener array de imágenes (con fallback a imagen única)
  const images = producto.imagenes && producto.imagenes.length > 0 
    ? producto.imagenes 
    : producto.imagen 
      ? [producto.imagen] 
      : [];

  const [imagenActual, setImagenActual] = useState(0);

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % images.length);
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + images.length) % images.length);
  };

  const irAImagen = (index) => {
    setImagenActual(index);
  };

  // Si no hay imágenes, mostrar placeholder
  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-96 md:h-[500px] bg-gray-100">
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-32 h-32 text-gray-400" />
          </div>
          {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
              ¡Últimas {producto.stock} unidades!
            </div>
          )}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-xl">
                Sin Stock
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Obtener URL de Cloudinary optimizada para vista principal
  const imagenPrincipalUrl = getCloudinaryUrl(images[imagenActual], CLOUDINARY_SIZES.gallery);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Imagen principal */}
      <div className="relative h-96 md:h-[500px] bg-gray-100 group">
        <Image
          src={imagenPrincipalUrl}
          alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
          fill
          className="object-contain p-8"
          priority={imagenActual === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
          quality={90}
        />

        {/* Badges de estado */}
        {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg z-10">
            ¡Últimas {producto.stock} unidades!
          </div>
        )}
        
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-xl">
              Sin Stock
            </span>
          </div>
        )}

        {/* Contador de imágenes */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold z-10">
            {imagenActual + 1} / {images.length}
          </div>
        )}

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={anteriorImagen}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={siguienteImagen}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="p-4 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {images.map((imagen, index) => {
              // URL optimizada para miniatura
              const thumbnailUrl = getCloudinaryUrl(imagen, CLOUDINARY_SIZES.thumbnail);
              
              return (
                <button
                  key={index}
                  onClick={() => irAImagen(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === imagenActual
                      ? 'border-jmr-green shadow-md scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={thumbnailUrl}
                    alt={`${producto.nombre} - Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navegación por teclado */}
      {images.length > 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 text-center">
            Usa las flechas ← → o haz clic en las miniaturas para navegar
          </p>
        </div>
      )}
    </div>
  );
}