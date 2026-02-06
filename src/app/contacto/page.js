import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-jmr-green to-jmr-green-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contacto
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Estamos aquí para ayudarte. ¡Comunícate con nosotros!
          </p>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* WhatsApp */}
            <a
              href="https://wa.me/543834927252"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-jmr-green group"
            >
              <div className="bg-[#25D366] text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
              <p className="text-gray-600">+54 383 492-7252</p>
              <p className="text-sm text-jmr-green mt-2">Click para chatear →</p>
            </a>

            {/* Teléfono */}
            <a
              href="tel:+543834927252"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-jmr-green group"
            >
              <div className="bg-jmr-green text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Teléfono</h3>
              <p className="text-gray-600">+54 383 492-7252</p>
              <p className="text-sm text-jmr-green mt-2">Llámanos →</p>
            </a>

            {/* Email */}
            <a
              href="mailto:cuerosjmr@hotmail.com"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-jmr-green group"
            >
              <div className="bg-jmr-green text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <p className="text-gray-600 text-sm break-all">cuerosjmr@hotmail.com</p>
              <p className="text-sm text-jmr-green mt-2">Escríbenos →</p>
            </a>

            {/* Horarios */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-jmr-green">
              <div className="bg-jmr-green text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Horarios</h3>
              <p className="text-gray-600 text-sm">Lunes a Viernes</p>
              <p className="text-gray-600 text-sm">9:00 - 13:00</p>
              <p className="text-gray-600 text-sm">16:00 - 20:00</p>
              <p className="text-gray-600 text-sm mt-2">Sábados: 9:00 - 13:00</p>
            </div>
          </div>

          {/* Sucursales */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-jmr-green text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-jmr-green">San Fernando</h3>
                  <p className="text-gray-700 text-lg mb-4">Rivadavia 564</p>
                  <p className="text-gray-600 mb-4">
                    Nuestra sucursal principal en el centro de la ciudad, fácil acceso y 
                    amplio surtido de productos.
                  </p>
                  <a
                    href="https://maps.google.com/?q=Rivadavia+564+San+Fernando+del+Valle+de+Catamarca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-jmr-green font-semibold hover:underline"
                  >
                    Ver en mapa →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-jmr-green text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-jmr-green">Valle Viejo</h3>
                  <p className="text-gray-700 text-lg mb-4">Av Pte Castillo 1165</p>
                  <p className="text-gray-600 mb-4">
                    Sucursal ubicada estratégicamente con estacionamiento y 
                    atención personalizada.
                  </p>
                  <a
                    href="https://maps.google.com/?q=Av+Pte+Castillo+1165+Valle+Viejo+Catamarca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-jmr-green font-semibold hover:underline"
                  >
                    Ver en mapa →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="text-center bg-gray-50 py-12 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Síguenos en Redes Sociales</h2>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.facebook.com/JMRmarroquineria"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] text-white p-4 rounded-full hover:scale-110 transition-transform"
              >
                <Facebook className="w-8 h-8" />
              </a>
              <a
                href="https://www.instagram.com/marroquineriajmr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-4 rounded-full hover:scale-110 transition-transform"
              >
                <Instagram className="w-8 h-8" />
              </a>
            </div>
            <p className="text-gray-600 mt-6">
              ¡No te pierdas nuestras ofertas y novedades!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}