'use client';

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { showToast } from 'nextjs-toast-notify';

const WHATSAPP_NUMBER = '543834644467';

export default function Cart() {
  const {
    cart,
    isOpen,
    setIsOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  } = useCart();

  const enviarPorWhatsApp = () => {
    if (cart.length === 0) {
      showToast.warning('⚠️ El carrito está vacío');
      return;
    }

    // Construir mensaje
    let mensaje = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
    
    cart.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.nombre}*\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio unitario: $${item.precio.toFixed(2)}\n`;
      mensaje += `   Subtotal: $${(item.precio * item.cantidad).toFixed(2)}\n\n`;
    });

    mensaje += `*TOTAL: $${getTotal().toFixed(2)}*\n\n`;
    mensaje += '¿Podrían confirmar la disponibilidad? ¡Gracias!';

    // Codificar mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;

    // Abrir WhatsApp
    window.open(url, '_blank');
    
    showToast.success('📱 Abriendo WhatsApp...');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-jmr-green text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Mi Carrito ({cart.length})</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-jmr-green-dark rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4" />
              <p className="text-lg">Tu carrito está vacío</p>
              <p className="text-sm mt-2">¡Agrega productos para empezar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 border-b pb-4 hover:bg-gray-50 transition-colors rounded-lg p-2">
                  {/* Imagen */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {item.nombre}
                    </h3>
                    {item.categoria && (
                      <p className="text-xs text-gray-500">{item.categoria.nombre}</p>
                    )}
                    <p className="text-jmr-green font-bold mt-1">
                      ${item.precio.toFixed(2)}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-jmr-green">${getTotal().toFixed(2)}</span>
            </div>

            {/* Botones */}
            <button
              onClick={enviarPorWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Pedir por WhatsApp
            </button>

            <button
              onClick={clearCart}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              Vaciar Carrito
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}