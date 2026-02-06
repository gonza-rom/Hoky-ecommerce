import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Users, Star, Award } from 'lucide-react';

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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src="/logo-jmr.png"
                alt="Marroquinería JMR"
                fill
                className="object-contain p-8"
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
                  de Catamarca y otra en Valle Viejo. Mi equipo, compuesto por mis dedicados hijos, 
                  Silvia, Lucas y Edith, desempeñan un papel fundamental en la atención al cliente 
                  y la gestión de inventario.
                </p>
                <p>
                  A través de una cuidadosa selección de mercadería de alta calidad, buscamos 
                  satisfacer las necesidades cambiantes de nuestros clientes.
                </p>
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
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Familia</h3>
              <p className="text-gray-600 text-sm">
                Un negocio familiar que atiende con calidez y cercanía
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-jmr-green">San Fernando</h3>
              <p className="text-gray-700 mb-2">📍 Rivadavia 564</p>
              <p className="text-gray-700 mb-2">📞 +54 383 492-7252</p>
              <p className="text-gray-600 text-sm">
                Nuestra sucursal principal en el corazón de la ciudad
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-jmr-green">Valle Viejo</h3>
              <p className="text-gray-700 mb-2">📍 Av Pte Castillo 1165</p>
              <p className="text-gray-700 mb-2">📞 +54 383 492-7252</p>
              <p className="text-gray-600 text-sm">
                Ubicados estratégicamente para mejor acceso
              </p>
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