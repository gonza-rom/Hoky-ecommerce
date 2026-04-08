import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalWhatsApp from '@/components/ConditionalWhatsApp';
import ConditionalFooter from '@/components/ConditionalFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hoky Indumentaria | Ropa Urbana y Streetwear',
  description: 'Indumentaria urbana de calidad. Remeras, pantalones, hoodies, camperas y accesorios streetwear. Envíos a todo el país.',
  keywords: 'hoky, indumentaria, ropa urbana, streetwear, remeras, pantalones, hoodies, camperas, catamarca',
  authors: [{ name: 'Hoky Indumentaria' }],
  creator: 'Hoky Indumentaria',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    title: 'Hoky Indumentaria | Ropa Urbana',
    description: 'Indumentaria urbana de calidad. Streetwear con estilo.',
    siteName: 'Hoky Indumentaria',
    images: [{ url: '/logo.jpeg', width: 800, height: 600, alt: 'Hoky Indumentaria' }],
  },
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <meta name="theme-color" content="#111111" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <CartProvider>
          <ConditionalNavbar />
          <main className="min-h-screen">
            {children}
          </main>
          <ConditionalFooter />
          <ConditionalWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}