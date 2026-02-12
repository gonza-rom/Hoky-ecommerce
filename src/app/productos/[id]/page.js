'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Package, Truck, Shield, Star, Plus, Minus, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';

// Variantes de animación reutilizables
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (params.id) fetchProducto();
  }, [params.id]);

  const fetchProducto = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/productos/${params.id}`);

      if (!response.ok) {
        setError(response.status === 404 ? 'not_found' : 'error');
        setProducto(null);
        return;
      }

      const data = await response.json();
      setProducto(data);

      // Cargar productos relacionados
      fetchRelacionados(data.categoriaId, data.id);
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError('error');
      setProducto(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelacionados = async (categoriaId, productoId) => {
    try {
      const response = await fetch('/api/productos');
      const todos = await response.json();
      const relacionados = todos
        .filter(p => p.categoriaId === categoriaId && p.id !== productoId)
        .slice(0, 4);
      setProductosRelacionados(relacionados);
    } catch (err) {
      console.error('Error al cargar relacionados:', err);
    }
  };

  const handleAgregarCarrito = () => {
    if (!producto || cantidad <= 0) return;
    addToCart(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleComprarWhatsApp = () => {
    if (!producto) return;
    const mensaje =
      `¡Hola! Me interesa este producto:\n\n` +
      `*${producto.nombre}*\n` +
      `Cantidad: ${cantidad}\n` +
      `Precio unitario: $${producto.precio.toFixed(2)}\n` +
      `Total: $${(producto.precio * cantidad).toFixed(2)}\n\n` +
      `¿Está disponible?`;
    window.open(`https://wa.me/543834927252?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleCompartir = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: producto.nombre, text: `Mira este producto: ${producto.nombre}`, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
      } catch {}
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-jmr-green mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
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

  const WhatsAppIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <motion.div
        className="bg-white border-b"
        initial="hidden" animate="visible" variants={fadeIn}
      >
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-500 hover:text-jmr-green transition-colors">Inicio</Link>
            <span className="text-gray-300">/</span>
            <Link href="/productos" className="text-gray-500 hover:text-jmr-green transition-colors">Productos</Link>
            {producto.categoria && (
              <>
                <span className="text-gray-300">/</span>
                <Link href={`/productos?categoria=${producto.categoriaId}`} className="text-gray-500 hover:text-jmr-green transition-colors">
                  {producto.categoria.nombre}
                </Link>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[160px] md:max-w-xs">{producto.nombre}</span>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Botón volver */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-jmr-green mb-4 md:mb-6 transition-colors text-sm md:text-base"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          Volver
        </motion.button>

        {/* ── Grid principal ── */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">

          {/* Galería */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <ProductGallery producto={producto} />
            <button
              onClick={handleCompartir}
              className="w-full mt-3 md:mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 md:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              Compartir Producto
            </button>
          </motion.div>

          {/* Info del producto */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:sticky lg:top-24">

              {/* Categoría */}
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="inline-block text-xs md:text-sm text-jmr-green font-semibold mb-2 hover:underline"
                >
                  {producto.categoria.nombre}
                </Link>
              )}

              {/* Nombre */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4 leading-tight">
                {producto.nombre}
              </h1>

              {/* Código */}
              {producto.codigoProducto && (
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  Código: {producto.codigoProducto}
                </p>
              )}

              {/* Precio */}
              <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                <span className="text-4xl md:text-5xl font-bold text-jmr-green">
                  ${producto.precio.toFixed(2)}
                </span>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Precio por unidad</p>
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* Proveedor */}
              {producto.proveedor && (
                <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Marca/Proveedor</h3>
                  <p className="text-gray-700 text-sm md:text-base">{producto.proveedor.nombre}</p>
                </div>
              )}

              {/* Stock */}
              <div className="mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
                  <span className={`text-sm md:text-base font-medium ${producto.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}
                  </span>
                </div>
              </div>

              {/* Selector de cantidad */}
              {producto.stock > 0 && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="p-2.5 md:p-3 hover:bg-gray-100 transition-colors"
                        aria-label="Disminuir"
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setCantidad(Math.max(1, Math.min(producto.stock, val)));
                        }}
                        className="w-14 md:w-20 text-center font-semibold outline-none text-sm md:text-base"
                        min="1"
                        max={producto.stock}
                      />
                      <button
                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                        className="p-2.5 md:p-3 hover:bg-gray-100 transition-colors"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                    <span className="text-gray-600 text-sm md:text-base">
                      Total:{' '}
                      <span className="font-bold text-jmr-green text-lg md:text-xl">
                        ${(producto.precio * cantidad).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-2 md:space-y-3">
                {producto.stock > 0 ? (
                  <>
                    <motion.button
                      onClick={handleAgregarCarrito}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full px-6 py-3.5 md:py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-base md:text-lg shadow-md ${
                        agregado
                          ? 'bg-green-600 text-white'
                          : 'bg-jmr-green hover:bg-jmr-green-dark text-white'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={agregado ? 'agregado' : 'agregar'}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                        >
                          {agregado ? '¡Agregado al carrito!' : 'Agregar al Carrito'}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      onClick={handleComprarWhatsApp}
                      whileTap={{ scale: 0.97 }}
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3.5 md:py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-base md:text-lg shadow-md"
                    >
                      <WhatsAppIcon />
                      Consultar por WhatsApp
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={handleComprarWhatsApp}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3.5 md:py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-base md:text-lg shadow-md"
                  >
                    <WhatsAppIcon />
                    Consultar Disponibilidad
                  </motion.button>
                )}
              </div>

              {/* Garantías */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t space-y-2 md:space-y-3">
                {[
                  { icon: Shield, text: 'Productos de calidad garantizada' },
                  { icon: Truck, text: 'Retiro en nuestras sucursales' },
                  { icon: Star, text: 'Más de 20 años de experiencia' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-xs md:text-sm text-gray-700">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-jmr-green flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Información adicional ── */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 mb-8 md:mb-12"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Información Adicional</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: Truck,
                title: 'Retiro en Tienda',
                desc: 'Retirá tu compra en nuestras sucursales de San Fernando o Valle Viejo.',
              },
              {
                icon: Shield,
                title: 'Garantía',
                desc: 'Todos nuestros productos cuentan con garantía del fabricante.',
              },
              {
                icon: Package,
                title: 'Stock Real',
                desc: 'La disponibilidad mostrada es en tiempo real. Confirmá antes de visitar.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} variants={fadeUp} custom={i}>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-jmr-green" />
                  {title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Productos Relacionados ── */}
        {productosRelacionados.length > 0 && (
          <motion.section
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Productos Relacionados
              </h2>
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="text-sm text-jmr-green hover:underline font-medium whitespace-nowrap"
                >
                  Ver todos →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {productosRelacionados.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
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