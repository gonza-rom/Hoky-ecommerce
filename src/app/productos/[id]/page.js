'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Package, Truck, Shield, Star, Plus, Minus, Share2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (params.id) {
      fetchProducto();
    }
  }, [params.id]);

  const fetchProducto = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/productos/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('not_found');
        } else {
          setError('error');
        }
        setProducto(null);
        return;
      }
      
      const data = await response.json();
      setProducto(data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('error');
      setProducto(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCarrito = () => {
    if (producto && cantidad > 0) {
      addToCart(producto, cantidad);
    }
  };

  const handleComprarWhatsApp = () => {
    if (!producto) return;

    const mensaje = `¡Hola! Me interesa este producto:\n\n` +
      `*${producto.nombre}*\n` +
      `Cantidad: ${cantidad}\n` +
      `Precio unitario: $${producto.precio.toFixed(2)}\n` +
      `Total: $${(producto.precio * cantidad).toFixed(2)}\n\n` +
      `¿Está disponible?`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/543834927252?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  };

  const handleCompartir = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: `Mira este producto: ${producto.nombre}`,
          url: url,
        });
      } catch (err) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-jmr-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'not_found' ? 'Producto no encontrado' : 'Error al cargar'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'not_found' 
                ? 'El producto que buscas no existe o ha sido eliminado.'
                : 'Hubo un problema al cargar el producto. Por favor, intenta de nuevo.'}
            </p>
            <div className="space-y-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Ver Todos los Productos
              </Link>
              {error === 'error' && (
                <button
                  onClick={fetchProducto}
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-600 hover:text-jmr-green transition-colors">
              Inicio
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/productos" className="text-gray-600 hover:text-jmr-green transition-colors">
              Productos
            </Link>
            {producto.categoria && (
              <>
                <span className="text-gray-400">/</span>
                <Link 
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="text-gray-600 hover:text-jmr-green transition-colors"
                >
                  {producto.categoria.nombre}
                </Link>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{producto.nombre}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-jmr-green mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de Imágenes */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="relative h-96 md:h-[500px] bg-gray-100">
                {producto.imagen ? (
                  <Image
                    src={producto.imagen}
                    alt={producto.nombre}
                    fill
                    className="object-contain p-8"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-32 h-32 text-gray-400" />
                  </div>
                )}
                
                {/* Badge de stock */}
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

            {/* Botón compartir */}
            <button
              onClick={handleCompartir}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Compartir Producto
            </button>
          </div>

          {/* Información del Producto */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 lg:sticky lg:top-24">
              {/* Categoría */}
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="inline-block text-sm text-jmr-green font-semibold mb-2 hover:underline"
                >
                  {producto.categoria.nombre}
                </Link>
              )}

              {/* Nombre */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {producto.nombre}
              </h1>

              {/* Código de producto */}
              {producto.codigoProducto && (
                <p className="text-sm text-gray-500 mb-4">
                  Código: {producto.codigoProducto}
                </p>
              )}

              {/* Precio */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-jmr-green">
                    ${producto.precio.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Precio por unidad
                </p>
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* Proveedor */}
              {producto.proveedor && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-2">Marca/Proveedor</h3>
                  <p className="text-gray-700">{producto.proveedor.nombre}</p>
                </div>
              )}

              {/* Stock disponible */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    {producto.stock > 0 
                      ? `${producto.stock} unidades disponibles`
                      : 'Sin stock'
                    }
                  </span>
                </div>
              </div>

              {/* Selector de cantidad */}
              {producto.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setCantidad(Math.max(1, Math.min(producto.stock, val)));
                        }}
                        className="w-20 text-center font-semibold outline-none"
                        min="1"
                        max={producto.stock}
                      />
                      <button
                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      Total: <span className="font-bold text-jmr-green text-xl">
                        ${(producto.precio * cantidad).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                {producto.stock > 0 ? (
                  <>
                    <button
                      onClick={handleAgregarCarrito}
                      className="w-full bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
                    >
                      <ShoppingBag className="w-6 h-6" />
                      Agregar al Carrito
                    </button>
                    
                    <button
                      onClick={handleComprarWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Consultar por WhatsApp
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleComprarWhatsApp}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Consultar Disponibilidad
                  </button>
                )}
              </div>

              {/* Garantías */}
              <div className="mt-8 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Shield className="w-5 h-5 text-jmr-green flex-shrink-0" />
                  <span>Productos de calidad garantizada</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Truck className="w-5 h-5 text-jmr-green flex-shrink-0" />
                  <span>Retiro en nuestras sucursales</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Star className="w-5 h-5 text-jmr-green flex-shrink-0" />
                  <span>Más de 20 años de experiencia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de información adicional */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Información Adicional</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-jmr-green" />
                Retiro en Tienda
              </h3>
              <p className="text-gray-600 text-sm">
                Retirá tu compra en nuestras sucursales de San Fernando o Valle Viejo.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-jmr-green" />
                Garantía
              </h3>
              <p className="text-gray-600 text-sm">
                Todos nuestros productos cuentan con garantía del fabricante.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-jmr-green" />
                Stock Real
              </h3>
              <p className="text-gray-600 text-sm">
                La disponibilidad mostrada es en tiempo real. Confirmá antes de visitar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}