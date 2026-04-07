// src/app/contacto/layout.js
// Server component — maneja el metadata
// La página tiene 'use client' para los hovers, así que el metadata va acá

export const metadata = {
  title:       'Contacto — Hoky Indumentaria',
  description: 'Contactate con Hoky Indumentaria. WhatsApp, Instagram y local en Esquiú 620, Catamarca.',
  keywords:    'hoky contacto, whatsapp hoky, local hoky catamarca, instagram hoky indumentaria',
  openGraph: {
    title:       'Contacto — Hoky Indumentaria',
    description: 'Escribinos por WhatsApp o visitanos en Esquiú 620, Catamarca.',
    type:        'website',
    locale:      'es_AR',
    siteName:    'Hoky Indumentaria',
    images: [{
      url:    '/logo.jpeg',
      width:  800,
      height: 800,
      alt:    'Hoky Indumentaria',
    }],
  },
  twitter: {
    card:        'summary',
    title:       'Contacto — Hoky Indumentaria',
    description: 'Escribinos por WhatsApp o visitanos en Esquiú 620, Catamarca.',
    images:      ['/logo.jpeg'],
  },
};

export default function ContactoLayout({ children }) {
  return children;
}