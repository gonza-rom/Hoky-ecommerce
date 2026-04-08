'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Check, Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';

const CartContext = createContext();

// ── Toast interno ────────────────────────────────────────────────────────────
const ICONS = {
  success: Check,
  info:    ShoppingBag,
  warning: AlertTriangle,
  error:   Trash2,
};

const COLORS = {
  success: { bg: '#111',     text: '#fff', icon: '#fff' },
  info:    { bg: '#fff',     text: '#111', icon: '#111', border: '#e8e5e0' },
  warning: { bg: '#fff',     text: '#111', icon: '#f59e0b', border: '#e8e5e0' },
  error:   { bg: '#fff5f5',  text: '#b91c1c', icon: '#ef4444', border: '#fecaca' },
};

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 72,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
      width: 'max-content',
      maxWidth: 'calc(100vw - 32px)',
    }}>
      {toasts.map(toast => {
        const Icon   = ICONS[toast.type]   ?? Check;
        const colors = COLORS[toast.type]  ?? COLORS.success;
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border ?? 'transparent'}`,
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.01em',
              pointerEvents: 'auto',
              cursor: 'pointer',
              animation: 'hoky-toast-in 0.2s ease-out',
              whiteSpace: 'nowrap',
            }}
            onClick={() => onRemove(toast.id)}
          >
            <Icon size={14} color={colors.icon} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span>{toast.message}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes hoky-toast-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [cart,   setCart]   = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cargar carrito del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hoky-cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); }
      catch { localStorage.removeItem('hoky-cart'); }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    if (cart.length > 0) localStorage.setItem('hoky-cart', JSON.stringify(cart));
    else localStorage.removeItem('hoky-cart');
  }, [cart]);

  // Toast helper
  const toast = useCallback((message, type = 'success', duration = 2500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const addToCart = (producto, cantidad = 1) => {
    const existente = cart.find(item => item.id === producto.id);
    if (existente) {
      setCart(prev => prev.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
      ));
      toast(`Cantidad actualizada — ${producto.nombre}`, 'success');
    } else {
      setCart(prev => [...prev, { ...producto, cantidad }]);
      toast(`${producto.nombre} agregado al carrito`, 'success');
    }
  };

  const removeFromCart = (productoId) => {
    const producto = cart.find(item => item.id === productoId);
    if (producto) toast(`${producto.nombre} eliminado`, 'info');
    setCart(prev => prev.filter(item => item.id !== productoId));
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) { removeFromCart(productoId); return; }
    setCart(prev => prev.map(item =>
      item.id === productoId ? { ...item, cantidad } : item
    ));
  };

  const clearCart = () => {
    if (cart.length > 0) toast('Carrito vaciado', 'warning');
    setCart([]);
    localStorage.removeItem('hoky-cart');
  };

  const getTotal     = () => cart.reduce((t, i) => t + i.precio * i.cantidad, 0);
  const getItemCount = () => cart.reduce((t, i) => t + i.cantidad, 0);
  const toggleCart   = () => setIsOpen(prev => !prev);

  return (
    <CartContext.Provider value={{
      cart, isOpen, addToCart, removeFromCart,
      updateQuantity, clearCart, getTotal,
      getItemCount, toggleCart, setIsOpen,
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}