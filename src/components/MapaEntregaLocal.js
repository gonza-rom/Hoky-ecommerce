'use client';
// src/components/MapaEntregaLocal.js

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const CATAMARCA_CENTER = [-28.4682, -65.7795];

export default function MapaEntregaLocal({ onCoordsChange, onDireccionChange }) {
  const mapRef     = useRef(null);
  const markerRef  = useRef(null);
  const leafletRef = useRef(null);
  const initedRef  = useRef(false);

  const [calle,    setCalle]    = useState('');
  const [numero,   setNumero]   = useState('');
  const [barrio,   setBarrio]   = useState('');
  const [coords,   setCoords]   = useState(null);
  const [movido,   setMovido]   = useState(false);
  const [cargando, setCargando] = useState(true);

  // Notificar cambios al padre
    const notificar = useCallback((newCoords, newCalle, newNumero, newBarrio) => {
    const dir = [newCalle, newNumero, newBarrio].filter(Boolean).join(' ');
    onDireccionChange?.({ direccion: dir, calle: newCalle, numero: newNumero, barrio: newBarrio });
    onCoordsChange?.(newCoords);
    }, [onCoordsChange, onDireccionChange]);

  useEffect(() => {
    notificar(coords, calle, numero, barrio);
  }, [calle, numero, barrio, coords]);

  // Cargar Leaflet
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script    = document.createElement('script');
    script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload   = initMapa;
    script.onerror  = () => setCargando(false);
    document.head.appendChild(script);
  }, []);

  function initMapa() {
    if (!mapRef.current || !window.L) return;
    setCargando(false);

    const L   = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView(CATAMARCA_CENTER, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:#111;transform:rotate(-45deg);
        border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>`,
      iconSize: [28, 28], iconAnchor: [14, 28], className: '',
    });

    const marker = L.marker(CATAMARCA_CENTER, { draggable: true, icon }).addTo(map);
    markerRef.current  = marker;
    leafletRef.current = map;

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      setCoords({ lat, lng });
      setMovido(true);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      setMovido(true);
    });
  }

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white';

  return (
    <div className="flex flex-col gap-3">

      {/* Campos de dirección */}
      <div className="grid grid-cols-[1fr_100px] gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Calle *</label>
          <input
            value={calle}
            onChange={e => setCalle(e.target.value)}
            placeholder="Ej: Av. Belgrano"
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Número *</label>
          <input
            value={numero}
            onChange={e => setNumero(e.target.value)}
            placeholder="1234"
            className={inp}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Barrio / Referencia (opcional)</label>
        <input
          value={barrio}
          onChange={e => setBarrio(e.target.value)}
          placeholder="Ej: Barrio Norte, entre Rivadavia y..."
          className={inp}
        />
      </div>

      {/* Aviso de zonas */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <MapPin size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>Capital gratis</strong> · Valle Viejo y Valle Chico <strong>$2.000 mínimo</strong>.
          El costo exacto se coordina por WhatsApp.
        </p>
      </div>

      {/* Mapa */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1.5">
          Confirmá tu ubicación en el mapa <span className="font-normal text-gray-400">(opcional)</span>
        </p>
        {cargando && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm" style={{ height: 220 }}>
            <Loader2 size={16} className="animate-spin" /> Cargando mapa...
          </div>
        )}
        <div
          ref={mapRef}
          style={{
            height: cargando ? 0 : 220,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            zIndex: 0,
          }}
        />
        {!cargando && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <MapPin size={11} />
            {movido ? 'Ubicación marcada ✓' : 'Hacé click en el mapa o arrastrá el pin para marcar tu ubicación'}
          </p>
        )}
      </div>
    </div>
  );
}