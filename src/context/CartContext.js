'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { showToast } from 'nextjs-toast-notify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('hoky-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('hoky-cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('hoky-cart');
    }
  }, [cart]);

  const addToCart = (producto, cantidad = 1) => {
    const existente = cart.find(item => item.id === producto.id);
    
    if (existente) {
      // Actualizar cantidad
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
      
      // Toast DESPUÉS de actualizar estado
      showToast.success(`🛒 Se actualizó la cantidad de ${producto.nombre}`, {
        position: 'top-center', // Abajo a la derecha para no molestar
        duration: 2000,
      });
    } else {
      // Agregar nuevo producto
      setCart(prevCart => [...prevCart, { ...producto, cantidad }]);
      
      // Toast DESPUÉS de actualizar estado
      showToast.success(`✅ ${producto.nombre} agregado al carrito`, {
        position: 'top-center', // Abajo a la derecha
        duration: 2000,
      });
    }
    
    // Abrir el carrito brevemente
    setIsOpen(true);
    setTimeout(() => setIsOpen(false), 2000);
  };

  const removeFromCart = (productoId) => {
    const producto = cart.find(item => item.id === productoId);
    
    if (producto) {
      showToast.info(`🗑️ ${producto.nombre} eliminado del carrito`, {
        position: 'top-center',
        duration: 2000,
      });
    }
    
    setCart(prevCart => prevCart.filter(item => item.id !== productoId));
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      )
    );
    
    // Toast solo cuando se cambia manualmente (no mostrar para cada click)
    // const producto = cart.find(item => item.id === productoId);
    // if (producto) {
    //   showToast.info(`🔄 Cantidad actualizada: ${producto.nombre}`, {
    //     position: 'bottom-right',
    //     duration: 1500,
    //   });
    // }
  };

  const clearCart = () => {
    if (cart.length > 0) {
      showToast.warning('🧹 Carrito vaciado', {
        position: 'top-center',
        duration: 2000,
      });
    }
    
    setCart([]);
    localStorage.removeItem('hoky-cart');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        toggleCart,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}