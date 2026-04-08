'use client';

import { MapPin, Clock, Instagram } from 'lucide-react';

const WHATSAPP  = '5493834644467';
const INSTAGRAM = 'https://www.instagram.com/hoky.indumentaria';
const MAPS      = 'https://maps.app.goo.gl/etsJBVaNJ4CVgaHMA';

export default function ContactoPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#111] text-white px-5 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 mb-3">Contacto</p>
          <h1 className="font-['Bebas_Neue'] text-[clamp(48px,10vw,72px)] leading-none tracking-wide mb-4">
            HABLEMOS
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Consultas, tallas, disponibilidad — escribinos y te respondemos rápido.
          </p>
        </div>
      </section>

      {/* ── Cards de contacto ── */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline group"
          >
            <div className="border border-[#e0dbd5] group-hover:border-[#111] transition-colors p-6 h-full">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center mb-4">
                <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-1.5">WhatsApp</p>
              <p className="text-sm font-semibold text-[#111] mb-1">+54 9 383 464-4467</p>
              <p className="text-xs text-[#25D366]">Escribinos →</p>
            </div>
          </a>

          {/* Instagram */}
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline group"
          >
            <div className="border border-[#e0dbd5] group-hover:border-[#111] transition-colors p-6 h-full">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <Instagram size={18} color="#fff" />
              </div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-1.5">Instagram</p>
              <p className="text-sm font-semibold text-[#111] mb-1">@hoky.indumentaria</p>
              <p className="text-xs text-gray-400">Ver perfil →</p>
            </div>
          </a>

          {/* Horarios */}
          <div className="border border-[#e0dbd5] p-6 h-full">
            <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center mb-4">
              <Clock size={18} color="#fff" />
            </div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-1.5">Horarios</p>
            <p className="text-sm font-semibold text-[#111] mb-1">Lunes a Sábados</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              9:00 — 13:30 hs<br />
              18:00 — 22:00 hs
            </p>
          </div>
        </div>
      </section>

      {/* ── Dónde estamos ── */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        {/*
          En móvil: columna (info arriba, mapa abajo con altura fija)
          En desktop: dos columnas iguales lado a lado
        */}
        <div className="border border-[#e0dbd5] flex flex-col md:grid md:grid-cols-2">

          {/* Info dirección */}
          <div className="bg-[#111] text-white px-6 py-8 md:p-10">
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 mb-5">Dónde estamos</p>

            <div className="flex items-start gap-3 mb-5">
              <MapPin size={16} className="flex-shrink-0 mt-0.5 text-white/60" />
              <div>
                <p className="text-base font-bold mb-1">Esquiú 620</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Antes de llegar a Rivadavia<br />
                  San Fernando del V. de Catamarca
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-7">
              <Clock size={16} className="flex-shrink-0 mt-0.5 text-white/60" />
              <div>
                <p className="text-sm font-semibold mb-1">Lunes a Sábados</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  9:00 a 13:30 hs<br />
                  18:00 a 22:00 hs
                </p>
              </div>
            </div>

            <a
              href={MAPS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#111] text-[11px] tracking-[0.14em] uppercase font-bold px-5 py-3 no-underline hover:bg-white/90 transition-colors"
            >
              Abrir en Maps →
            </a>
          </div>

          {/* Mapa — altura fija en móvil, ocupa todo el alto en desktop */}
          <div className="relative h-64 md:h-auto min-h-[280px] bg-[#e8e3dc]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3534.!2d-65.78!3d-28.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942339a0b99a3b05%3A0xf7a6e9cf0b4a3c6a!2sEsqui%C3%BA%20620%2C%20San%20Fernando%20del%20Valle%20de%20Catamarca!5e0!3m2!1ses!2sar!4v1"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hoky Indumentaria — Ubicación"
            />
          </div>

        </div>
      </section>

    </div>
  );
}