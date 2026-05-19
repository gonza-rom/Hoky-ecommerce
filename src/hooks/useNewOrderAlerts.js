// src/hooks/useNewOrderAlerts.js
import { useEffect, useRef, useCallback } from 'react';

export function useNewOrderAlerts({ onNewOrders, intervalMs = 30_000 }) {
  const lastSeenIdRef = useRef(null);
  const isFirstRunRef = useRef(true);

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pedidos?pageSize=5&sort=createdAt_desc');
      const data = await res.json();
      const pedidos = data.data ?? [];
      if (!pedidos.length) return;

      const latestId = pedidos[0].id;

      if (isFirstRunRef.current) {
        lastSeenIdRef.current = latestId;
        isFirstRunRef.current = false;
        return;
      }

      if (latestId === lastSeenIdRef.current) return;

      // Encontrar cuántos son nuevos
      const newOrders = pedidos.filter(p => {
        // Comparar por fecha en lugar de ID si el ID no es secuencial
        return new Date(p.createdAt) > new Date(/* fecha del último visto */);
      });

      // Más simple: contar los que tienen ID distinto al último visto
      const idx = pedidos.findIndex(p => p.id === lastSeenIdRef.current);
      const nuevos = idx === -1 ? pedidos : pedidos.slice(0, idx);

      if (nuevos.length > 0) {
        lastSeenIdRef.current = latestId;
        onNewOrders(nuevos);
      }
    } catch (e) {
      console.error('Error checking orders:', e);
    }
  }, [onNewOrders]);

  useEffect(() => {
    check();
    const interval = setInterval(check, intervalMs);
    return () => clearInterval(interval);
  }, [check, intervalMs]);
}