// src/lib/envio.js
// Tabla de zonas de envío con precios aproximados
// Cuando tengas API de Andreani/OCA, solo reemplazás calcularEnvio()

export const ZONAS_ENVIO = [
  {
    id:          'local',
    nombre:      'Local',
    provincias:  ['catamarca'],
    precio:      4000,
    diasMin:     1,
    diasMax:     2,
    envioGratis: true,   // aplica envío gratis desde el mínimo
  },
  {
    id:          'noa',
    nombre:      'NOA',
    provincias:  ['tucuman', 'salta', 'jujuy', 'santiago del estero', 'la rioja'],
    precio:      6500,
    diasMin:     2,
    diasMax:     4,
    envioGratis: true,
  },
  {
    id:          'centro',
    nombre:      'Centro',
    provincias:  ['cordoba', 'mendoza', 'san juan', 'san luis'],
    precio:      9000,
    diasMin:     3,
    diasMax:     5,
    envioGratis: false,
  },
  {
    id:          'litoral',
    nombre:      'Litoral',
    provincias:  ['santa fe', 'entre rios', 'corrientes', 'misiones', 'chaco', 'formosa'],
    precio:      10500,
    diasMin:     4,
    diasMax:     6,
    envioGratis: false,
  },
  {
    id:          'buenosaires',
    nombre:      'Buenos Aires',
    provincias:  ['buenos aires', 'ciudad autonoma de buenos aires', 'caba'],
    precio:      11000,
    diasMin:     3,
    diasMax:     5,
    envioGratis: false,
  },
  {
    id:          'sur',
    nombre:      'Patagonia',
    provincias:  ['neuquen', 'rio negro', 'chubut', 'santa cruz', 'tierra del fuego', 'la pampa'],
    precio:      15000,
    diasMin:     5,
    diasMax:     8,
    envioGratis: false,
  },
];

export const ENVIO_GRATIS_DESDE = 50000;

// Normaliza el texto para comparar sin tildes ni mayúsculas
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Dado el nombre de una provincia, devuelve la zona correspondiente
export function getZonaPorProvincia(provincia) {
  if (!provincia) return null;
  const norm = normalizar(provincia);
  return ZONAS_ENVIO.find(zona =>
    zona.provincias.some(p => normalizar(p) === norm)
  ) ?? null;
}

// Calcula el costo de envío dado la provincia y el subtotal del carrito
export function calcularEnvio(provincia, subtotal = 0) {
  const zona = getZonaPorProvincia(provincia);

  if (!zona) {
    return {
      zona:       null,
      precio:     null,
      gratis:     false,
      diasMin:    null,
      diasMax:    null,
      disponible: false,
      mensaje:    'Provincia no encontrada. Verificá el nombre ingresado.',
    };
  }

  const gratis = zona.envioGratis && subtotal >= ENVIO_GRATIS_DESDE;
  const precio = gratis ? 0 : zona.precio;

  return {
    zona,
    precio,
    gratis,
    diasMin:    zona.diasMin,
    diasMax:    zona.diasMax,
    disponible: true,
    mensaje:    gratis
      ? `¡Envío gratis a ${zona.nombre}! (${zona.diasMin}–${zona.diasMax} días hábiles)`
      : `Envío a ${zona.nombre}: $${precio.toLocaleString('es-AR')} (${zona.diasMin}–${zona.diasMax} días hábiles)`,
  };
}

// Lista de provincias argentinas para el select del checkout
export const PROVINCIAS_AR = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];