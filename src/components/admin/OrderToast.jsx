// src/components/admin/OrderToast.jsx
'use client';
import { useState, useCallback } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useNewOrderAlerts } from '@/hooks/useNewOrderAlerts';

const fmt = (n) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
}).format(n ?? 0);

function Toast({ id, pedidos, onDismiss }) {
  const esSolo = pedidos.length === 1;
  const p = pedidos[0];

  return (
    <div
      className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-md animate-in slide-in-from-right-full duration-300"
      style={{ borderLeft: '3px solid ' + (esSolo ? '#16a34a' : '#3b82f6'), maxWidth: 360 }}
    >
      {esSolo ? (
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-1 animate-ping" />
      ) : (
        <ShoppingBag size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-900">
            {esSolo ? 'Nuevo pedido recibido' : `${pedidos.length} pedidos nuevos`}
          </span>
          <span className="text-[11px] text-gray-400">ahora</span>
        </div>
        {esSolo ? (
          <p className="text-xs text-gray-500 m-0">
            <strong className="text-gray-800">#{p.id.slice(-6).toUpperCase()}</strong>
            {' · '}{p.compradorNombre ?? '—'}
            {' · '}<strong className="text-gray-800">{fmt(p.total)}</strong>
          </p>
        ) : (
          <p className="text-xs text-gray-500 m-0">
            Llegaron {pedidos.length} pedidos pendientes mientras no estabas
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="text-gray-300 hover:text-gray-500 flex-shrink-0"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function OrderAlertsProvider({ children, intervalMs = 30_000 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const onNewOrders = useCallback((pedidos) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, pedidos }]);
    // Sonido opcional (si el navegador lo permite)
    // new Audio('/sounds/ding.mp3').play().catch(() => {});
    // Auto-dismiss a los 8 segundos
    setTimeout(() => dismiss(id), 8_000);
  }, [dismiss]);

  useNewOrderAlerts({ onNewOrders, intervalMs });

  return (
    <>
      {children}
      {/* Contenedor de toasts — esquina inferior derecha */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <Toast key={t.id} id={t.id} pedidos={t.pedidos} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}