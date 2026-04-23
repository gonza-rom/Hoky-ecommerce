// src/app/api/geocoding/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');

  try {
    if (tipo === 'buscar') {
      const q = searchParams.get('q');

      // Intentar primero con Photon
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=es`,
          { headers: { 'User-Agent': 'HokyEcommerce/1.0' }, cache: 'no-store' }
        );
        if (res.ok) {
          const geojson = await res.json();
          const data = (geojson.features || [])
            .filter(f => f.properties.country === 'Argentina')
            .map(f => ({
              lat:          f.geometry.coordinates[1],
              lon:          f.geometry.coordinates[0],
              display_name: [
                f.properties.street && f.properties.housenumber
                  ? `${f.properties.street} ${f.properties.housenumber}`
                  : f.properties.name,
                f.properties.city || f.properties.town || f.properties.village,
                f.properties.state,
                'Argentina',
              ].filter(Boolean).join(', '),
              address: {
                road:         f.properties.street,
                house_number: f.properties.housenumber,
                suburb:       f.properties.suburb || f.properties.district,
                city:         f.properties.city || f.properties.town,
                state:        f.properties.state,
              },
            }));
          return NextResponse.json(data);
        }
      } catch {}

      // Fallback: Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent':      'HokyEcommerce/1.0 (hokyindumentaria@gmail.com)',
            'Accept-Language': 'es',
            'Referer':         'https://hoky-ecommerce.vercel.app',
          },
          cache: 'no-store',
        }
      );
      if (!res.ok) throw new Error(`Nominatim ${res.status}`);
      const data = await res.json();
      return NextResponse.json(Array.isArray(data) ? data : []);

    } else {
      // Geocoding inverso
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent':      'HokyEcommerce/1.0 (hokyindumentaria@gmail.com)',
            'Accept-Language': 'es',
            'Referer':         'https://hoky-ecommerce.vercel.app',
          },
          cache: 'no-store',
        }
      );
      if (!res.ok) throw new Error(`Nominatim reverse ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('Geocoding error:', error.message);
    // Devolver array vacío en vez de 500 para que el frontend muestre mensaje amigable
    return NextResponse.json(tipo === 'buscar' ? [] : {}, { status: 200 });
  }
}