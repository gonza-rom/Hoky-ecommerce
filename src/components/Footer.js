'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const marcas = [
    'Alpine Skate', 'Amayra', 'Biwoo', 'Bossi', 'Carey', 'ELF',
    'Everlast', 'Discovery', 'Head', 'LSD', 'Owen', 'Peyton',
    'Pierre Cardin', 'Queens', 'Royal Swiss', 'Trendy',
    'Uniform', 'Unicross', 'Wabro', 'WPC', 'Wilson'
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="relative w-40 h-20 mb-4 bg-white rounded-lg p-2">
              <Image
                src="/logo-jmr.png"
                alt="Marroquinería JMR"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm mb-4">
              Venta de productos de marroquinería de alta calidad desde 2003. 
              Atención personalizada y las mejores marcas.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/JMRmarroquineria"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-jmr-green rounded-full transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/marroquineriajmr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-jmr-green rounded-full transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-jmr-green transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-jmr-green transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-jmr-green transition-colors">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-jmr-green transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-jmr-green" />
                <div className="text-sm">
                  <p>Rivadavia 564 - SFVC</p>
                  <p>Av Pte Castillo 1165 - Valle Viejo</p>
                </div>
              </li>
              <li>
                <a
                  href="tel:+543834927252"
                  className="flex items-center gap-2 hover:text-jmr-green transition-colors"
                >
                  <Phone className="w-5 h-5 text-jmr-green" />
                  <span className="text-sm">+54 383 492-7252</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:cuerosjmr@hotmail.com"
                  className="flex items-center gap-2 hover:text-jmr-green transition-colors"
                >
                  <Mail className="w-5 h-5 text-jmr-green" />
                  <span className="text-sm">cuerosjmr@hotmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Marcas */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Nuestras Marcas</h3>
            <div className="flex flex-wrap gap-2">
              {marcas.slice(0, 10).map((marca) => (
                <span
                  key={marca}
                  className="text-xs bg-gray-800 px-2 py-1 rounded"
                >
                  {marca}
                </span>
              ))}
              <span className="text-xs text-gray-400">y más...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Marroquinería JMR. Todos los derechos reservados.</p>
            <p>Desarrollado con ❤️ en Catamarca</p>
          </div>
        </div>
      </div>

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/543834927252"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-lg transition-colors"
        title="Contactar por WhatsApp"
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </footer>
  );
}