// src/app/productos/layout.js
// Layout server component para inyectar metadata en /productos
// La página en sí tiene 'use client', así que el metadata va acá

export const metadata = {
  title:       'Catálogo — Hoky Indumentaria',
  description: 'Explorá nuestra colección de ropa urbana y streetwear. Remeras, pantalones, hoodies, camperas y más. Envíos a todo el país.',
  keywords:    'hoky, indumentaria, ropa urbana, streetwear, remeras, pantalones, hoodies, camperas, catamarca',
  openGraph: {
    title:       'Catálogo — Hoky Indumentaria',
    description: 'Ropa urbana y streetwear. Envíos a todo el país.',
    type:        'website',
    locale:      'es_AR',
    siteName:    'Hoky Indumentaria',
    images: [{
      url:    '/logo.jpeg',
      width:  800,
      height: 800,
      alt:    'Hoky Indumentaria — Catálogo',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Catálogo — Hoky Indumentaria',
    description: 'Ropa urbana y streetwear. Envíos a todo el país.',
    images:      ['/logo.jpeg'],
  },
};

export default function ProductosLayout({ children }) {
  return children;
}