// src/lib/precios.js
// Calcula los precios derivados a partir del precio base y el descuento configurado.
// precio base = precio tarjeta (el más alto)
// efectivo y transferencia = precio * (1 - descuento/100)

export const DESCUENTO_EFECTIVO_DEFAULT = 10; // 10%

/**
 * Dado un precio base y un % de descuento, devuelve los 3 precios a guardar en BD.
 */
export function calcularPrecios(precioBase, descuentoPorcentaje = DESCUENTO_EFECTIVO_DEFAULT) {
  const descuento = Math.max(0, Math.min(100, descuentoPorcentaje ?? DESCUENTO_EFECTIVO_DEFAULT));
  const precioConDescuento = Math.round(precioBase * (1 - descuento / 100));

  return {
    precioTarjeta:       precioBase,
    precioEfectivo:      precioConDescuento,
    precioTransferencia: precioConDescuento,
    descuentoEfectivo:   descuento,
  };
}

/**
 * Dado un producto y un método de pago, devuelve el precio a cobrar.
 */
export function getPrecioSegunMetodo(producto, metodoPago) {
  if (!metodoPago || metodoPago === 'mercadopago') {
    return producto.precio; // precio tarjeta = precio base
  }
  if (metodoPago === 'efectivo' || metodoPago === 'transferencia') {
    // Si tiene precioEfectivo guardado, usarlo; si no, calcular en el momento
    if (producto.precioEfectivo) return producto.precioEfectivo;
    const descuento = producto.descuentoEfectivo ?? DESCUENTO_EFECTIVO_DEFAULT;
    return Math.round(producto.precio * (1 - descuento / 100));
  }
  return producto.precio;
}