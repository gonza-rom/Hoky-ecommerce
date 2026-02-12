'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, X, ZoomIn, ZoomOut, Maximize2, AlertCircle } from 'lucide-react';

export default function ProductGallery({ producto }) {
  // 🔍 Filtrar data URIs y solo mantener URLs válidas
  const images = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes.filter(url => url && url.startsWith('http')) // Solo URLs válidas
    : producto.imagen && producto.imagen.startsWith('http')
      ? [producto.imagen]
      : [];

  // 🔍 Detectar si hay data URIs (imágenes base64 que no funcionan)
  const hasDataUris = 
    (producto.imagen && producto.imagen.startsWith('data:image/')) ||
    (producto.imagenes && producto.imagenes.some(url => url && url.startsWith('data:image/')));

  const [imagenActual, setImagenActual] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });

  const abrirLightbox = () => {
    setLightboxAbierto(true);
    setZoom(1);
    setPosicion({ x: 0, y: 0 });
  };

  const cerrarLightbox = useCallback(() => {
    setLightboxAbierto(false);
    setZoom(1);
    setPosicion({ x: 0, y: 0 });
  }, []);

  const siguienteImagen = useCallback(() => {
    setImagenActual((prev) => (prev + 1) % images.length);
    setZoom(1);
    setPosicion({ x: 0, y: 0 });
  }, [images.length]);

  const anteriorImagen = useCallback(() => {
    setImagenActual((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setPosicion({ x: 0, y: 0 });
  }, [images.length]);

  const aumentarZoom = () => setZoom((prev) => Math.min(prev + 0.5, 4));

  const reducirZoom = () => {
    setZoom((prev) => {
      const nuevoZoom = Math.max(prev - 0.5, 1);
      if (nuevoZoom === 1) setPosicion({ x: 0, y: 0 });
      return nuevoZoom;
    });
  };

  const resetZoom = () => {
    setZoom(1);
    setPosicion({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoom((prev) => {
        const nuevoZoom = Math.max(prev - 0.25, 1);
        if (nuevoZoom === 1) setPosicion({ x: 0, y: 0 });
        return nuevoZoom;
      });
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setArrastrando(true);
      setInicioArrastre({ x: e.clientX - posicion.x, y: e.clientY - posicion.y });
    }
  };

  const handleMouseMove = (e) => {
    if (arrastrando && zoom > 1) {
      setPosicion({
        x: e.clientX - inicioArrastre.x,
        y: e.clientY - inicioArrastre.y,
      });
    }
  };

  const handleMouseUp = () => setArrastrando(false);

  useEffect(() => {
    if (!lightboxAbierto) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') cerrarLightbox();
      if (e.key === 'ArrowRight') siguienteImagen();
      if (e.key === 'ArrowLeft') anteriorImagen();
      if (e.key === '+' || e.key === '=') aumentarZoom();
      if (e.key === '-') reducirZoom();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxAbierto, cerrarLightbox, siguienteImagen, anteriorImagen]);

  useEffect(() => {
    document.body.style.overflow = lightboxAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxAbierto]);

  // 🔍 Mostrar advertencia si hay data URIs
  if (hasDataUris && images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-orange-900 mb-3">
              ⚠️ Imágenes No Disponibles
            </h3>
            <p className="text-orange-800 mb-4 text-sm">
              Este producto tiene imágenes en formato <code className="bg-orange-200 px-1 rounded">data:image/base64</code> 
              que no pueden mostrarse en la galería.
            </p>
            <div className="bg-orange-200 rounded-lg p-4 text-left text-xs text-orange-900 space-y-2">
              <p className="font-semibold">🔧 Solución:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Sube las imágenes a Cloudinary</li>
                <li>Edita el producto</li>
                <li>Reemplaza las imágenes antiguas</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-96 md:h-[500px] bg-gray-100">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="w-32 h-32 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Sin imágenes disponibles</p>
            </div>
          </div>
          {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
              ¡Últimas {producto.stock} unidades!
            </div>
          )}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-xl">Sin Stock</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Galería principal ── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        {/* 🔍 Advertencia si hay mezcla de URLs válidas y data URIs */}
        {hasDataUris && images.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs text-yellow-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Algunas imágenes no se muestran</p>
              <p>Este producto tiene imágenes en formato base64 que fueron omitidas. Considera reemplazarlas con URLs de Cloudinary.</p>
            </div>
          </div>
        )}

        {/* Imagen principal */}
        <div
          className="relative h-96 md:h-[500px] bg-gray-100 group cursor-zoom-in"
          onClick={abrirLightbox}
        >
          <Image
            src={images[imagenActual]}
            alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
            fill
            className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
            priority={imagenActual === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            quality={90}
          />

          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5" />
            Click para ampliar
          </div>

          {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg z-10">
              ¡Últimas {producto.stock} unidades!
            </div>
          )}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-xl">Sin Stock</span>
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold z-10">
              {imagenActual + 1} / {images.length}
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); anteriorImagen(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); siguienteImagen(); }}
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
              {images.map((imagen, index) => (
                <button
                  key={index}
                  onClick={() => { setImagenActual(index); resetZoom(); }}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === imagenActual
                      ? 'border-jmr-green shadow-md scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={imagen}
                    alt={`${producto.nombre} - Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 text-center">
            {images.length > 1
              ? 'Haz clic en la imagen para ampliar · Usa ← → para navegar'
              : 'Haz clic en la imagen para ampliar'}
          </p>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxAbierto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none"
          onClick={cerrarLightbox}
        >
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/70 text-sm font-medium truncate max-w-xs">
              {producto.nombre}
              {images.length > 1 && (
                <span className="ml-2 text-white/40">{imagenActual + 1} / {images.length}</span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={reducirZoom}
                disabled={zoom <= 1}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                title="Reducir zoom (−)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={resetZoom}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-w-[52px] text-center"
                title="Restablecer zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={aumentarZoom}
                disabled={zoom >= 4}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button
                onClick={cerrarLightbox}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); if (zoom === 1) cerrarLightbox(); }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (arrastrando ? 'grabbing' : 'grab') : 'zoom-out' }}
          >
            <div
              style={{
                transform: `scale(${zoom}) translate(${posicion.x / zoom}px, ${posicion.y / zoom}px)`,
                transition: arrastrando ? 'none' : 'transform 0.2s ease',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <Image
                src={images[imagenActual]}
                alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                quality={95}
                draggable={false}
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); anteriorImagen(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-4 rounded-full transition-all z-10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); siguienteImagen(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-4 rounded-full transition-all z-10"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div
              className="flex-shrink-0 px-6 py-4 flex justify-center gap-3 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((imagen, index) => (
                <button
                  key={index}
                  onClick={() => { setImagenActual(index); resetZoom(); }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === imagenActual
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imagen}
                    alt={`Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex-shrink-0 pb-4 text-center pointer-events-none">
            <p className="text-white/25 text-xs">
              Esc o click para cerrar · ← → para navegar · Rueda o +/− para zoom
            </p>
          </div>
        </div>
      )}
    </>
  );
}