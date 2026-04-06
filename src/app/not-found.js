// src/app/not-found.js
import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada — Hoky Indumentaria',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>

        {/* Número grande */}
        <p style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(80px, 20vw, 140px)',
          lineHeight: 1, letterSpacing: '0.04em',
          color: '#f0ede8', margin: '0 0 8px', userSelect: 'none',
        }}>
          404
        </p>

        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 26px)',
          fontWeight: 800, color: '#111',
          letterSpacing: '-0.02em', margin: '0 0 12px',
        }}>
          Esta página no existe
        </h1>

        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, margin: '0 0 32px' }}>
          La URL que buscás no está disponible o fue movida.
          Puede que el producto haya sido eliminado o que el link esté mal escrito.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/productos" style={{
            display: 'inline-block',
            background: '#111', color: '#fff',
            padding: '12px 28px', borderRadius: 8,
            fontSize: 13, fontWeight: 700,
            textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            Ver productos
          </Link>
          <Link href="/" style={{
            display: 'inline-block',
            background: 'transparent', color: '#555',
            padding: '12px 28px', borderRadius: 8,
            border: '1px solid #e0dbd5',
            fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}>
            Ir al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}