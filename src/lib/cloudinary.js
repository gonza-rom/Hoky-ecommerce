/**
 * Construye URLs de Cloudinary con transformaciones
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tu-cloud-name';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Construye URL de imagen de Cloudinary
 * @param {string} publicIdOrUrl - Public ID o URL completa
 * @param {object} options - Opciones de transformación
 * @returns {string} URL completa de Cloudinary
 */
export function getCloudinaryUrl(publicIdOrUrl, options = {}) {
  // Si ya es una URL completa, retornarla tal cual
  if (publicIdOrUrl?.startsWith('http')) {
    return publicIdOrUrl;
  }
  
  // Si no tiene publicId, retornar placeholder
  if (!publicIdOrUrl) {
    return '/placeholder-product.jpg';
  }
  
  // Construir transformaciones
  const transformations = buildTransformations(options);
  
  // Construir URL
  return `${BASE_URL}/${transformations}${publicIdOrUrl}`;
}

/**
 * Construye string de transformaciones
 */
function buildTransformations(options) {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;
  
  let transforms = [];
  
  // Calidad y formato
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  
  // Dimensiones
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  
  return transforms.join(',') + '/';
}

/**
 * Tamaños predefinidos para la galería
 */
export const CLOUDINARY_SIZES = {
  thumbnail: { width: 150, height: 150, crop: 'fill' },
  card: { width: 400, height: 400, crop: 'fill' },
  gallery: { width: 1200, height: 1200, crop: 'fit' },
  fullscreen: { width: 2000, height: 2000, crop: 'fit' },
};

/**
 * Helper para obtener múltiples tamaños
 */
export function getImageSizes(publicIdOrUrl) {
  return {
    thumbnail: getCloudinaryUrl(publicIdOrUrl, CLOUDINARY_SIZES.thumbnail),
    card: getCloudinaryUrl(publicIdOrUrl, CLOUDINARY_SIZES.card),
    gallery: getCloudinaryUrl(publicIdOrUrl, CLOUDINARY_SIZES.gallery),
    fullscreen: getCloudinaryUrl(publicIdOrUrl, CLOUDINARY_SIZES.fullscreen),
  };
}