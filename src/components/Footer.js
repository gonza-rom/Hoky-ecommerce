'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-hoky-black text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Marca */}
          <div>
            <div className="relative w-24 h-10 mb-5 invert">
              <Image
                src="/logo.jpeg"
                alt="Hoky Indumentaria"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed mb-5 text-gray-500">
              Indumentaria urbana pensada para la calle. Calidad que se nota, estilo que se vive.
            </p>
            <a
              href="https://www.instagram.com/hoky.indumentaria/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @hoky.indumentaria
            </a>
          </div>

          {/* Navegación */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/productos', label: 'Catálogo' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white mb-4">
              Contacto
            </p>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a
                  href="https://wa.me/5493834000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Catamarca, Argentina
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-gray-600">
            <p>&copy; {new Date().getFullYear()} Hoky Indumentaria. Todos los derechos reservados.</p>
            <p>Desarrollado por Gonzalo Romero · DevHub</p>
          </div>
        </div>
      </div>

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/5493834644467"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-lg transition-colors"
        title="Contactar por WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </footer>
  );
}