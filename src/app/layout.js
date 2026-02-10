import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Marroquinería JMR - Tienda Online | Mochilas, Bolsos y Carteras en Catamarca',
  description: 'Venta de productos de marroquinería de alta calidad en Catamarca. Mochilas, bolsos, carteras, billeteras y más. Más de 20 años de experiencia. Sucursales en San Fernando y Valle Viejo.',
  keywords: 'marroquinería, mochilas, bolsos, carteras, billeteras, cuero, catamarca, san fernando, valle viejo, alpine skate, everlast, head, wilson, pierre cardin',
  authors: [{ name: 'Marroquinería JMR' }],
  creator: 'Marroquinería JMR',
  publisher: 'Marroquinería JMR',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.jmrmarroquineria.com.ar',
    title: 'Marroquinería JMR - Mochilas, Bolsos y Carteras',
    description: 'Venta de productos de marroquinería de alta calidad. Más de 20 años en Catamarca.',
    siteName: 'Marroquinería JMR',
    images: [
      {
        url: '/logo-jmr.png',
        width: 1200,
        height: 630,
        alt: 'Marroquinería JMR Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marroquinería JMR - Tienda Online',
    description: 'Mochilas, bolsos, carteras y más. Catamarca, Argentina.',
    images: ['/logo-jmr.png'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://www.jmrmarroquineria.com.ar',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logo-jmr.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo-jmr.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo-jmr.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-jmr.png" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}