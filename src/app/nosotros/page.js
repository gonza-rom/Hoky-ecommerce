import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Star, Award, TrendingUp } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-jmr-green to-jmr-green-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nuestra Historia
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Más de 20 años brindando calidad y confianza en Catamarca
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src="/local-fachada.jpg"
                alt="Fachada Marroquinería JMR"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">
                ¡Hola, soy María Lourdes Quispe!
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  A lo largo de mi trayectoria comercial, mi enfoque ha evolucionado hacia la 
                  compra y reventa de mercadería, marcando un cambio significativo en mi negocio. 
                  Inicialmente, comencé vendiendo cintos y billeteras artesanales en las calles, 
                  pero con el tiempo, identifiqué oportunidades en el mercado y decidí ampliar 
                  mis horizontes.
                </p>
                <p>
                  En septiembre de 2003, alquilé mi primer local, proporcionando una plataforma 
                  para exhibir y vender diversos productos de cuero. Este paso me permitió no 
                  solo consolidar mi presencia en el mercado local sino también diversificar 
                  mi oferta.
                </p>
                <p>
                  Actualmente, gestiono con éxito dos sucursales, una en San Fernando del Valle 
                  de Catamarca y otra en Valle Viejo. A través de una cuidadosa selección de 
                  mercadería de alta calidad, buscamos satisfacer las necesidades cambiantes 
                  de nuestros clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Galería del Local */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Nuestro Local</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Image
                  src="/local-interior-1.jpg"
                  alt="Interior Marroquinería JMR 1"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Image
                  src="/local-interior-2.jpg"
                  alt="Interior Marroquinería JMR 2"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Image
                  src="/local-interior-3.jpg"
                  alt="Interior Marroquinería JMR 3"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Valores</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Pasión</h3>
              <p className="text-gray-600 text-sm">
                Amor por lo que hacemos y dedicación en cada producto
              </p>
            </div>
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Calidad</h3>
              <p className="text-gray-600 text-sm">
                Selección cuidadosa de las mejores marcas y productos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Servicio</h3>
              <p className="text-gray-600 text-sm">
                Atención personalizada para cada cliente
              </p>
            </div>
            <div className="text-center">
              <div className="bg-jmr-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Experiencia</h3>
              <p className="text-gray-600 text-sm">
                Más de 20 años en el mercado catamarqueño
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sucursales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestras Sucursales</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-jmr-green">
              <h3 className="text-xl font-bold mb-4 text-jmr-green">Sucursal Central - San Fernando</h3>
              <p className="text-gray-700 mb-2">📍 Rivadavia 564</p>
              <p className="text-gray-700 mb-2">📞 +54 383 492-7252</p>
              <p className="text-gray-600 text-sm mb-3">
                En el corazón de la ciudad
              </p>
              <a
                href="https://maps.app.goo.gl/qAhZgq3nbN8k6MRx7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jmr-green font-semibold hover:underline"
              >
                Ver en mapa →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-jmr-green">
              <h3 className="text-xl font-bold mb-4 text-jmr-green">Valle Viejo</h3>
              <p className="text-gray-700 mb-2">📍 Av Pte Castillo 1165</p>
              <p className="text-gray-700 mb-2">📞 +54 383 492-7252</p>
              <p className="text-gray-600 text-sm mb-3">
                Ubicación estratégica con estacionamiento
              </p>
              <a
                href="https://maps.app.goo.gl/QoTBKrUCSEzssJ8C7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jmr-green font-semibold hover:underline"
              >
                Ver en mapa →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-jmr-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para encontrar tu producto ideal?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explora nuestro catálogo completo de productos de marroquinería
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-white text-jmr-green px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Ver Productos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}