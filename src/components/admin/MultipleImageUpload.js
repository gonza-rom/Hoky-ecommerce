'use client';
// src/components/admin/MultipleImageUpload.js

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MultipleImageUpload({
  value = [],
  onChange,
  maxImagenes = 10,
  folder = 'hoky/productos',
}) {
  const [subiendo, setSubiendo]   = useState(false);
  const [progreso, setProgreso]   = useState(0);
  const [error,    setError]      = useState('');

  const imagenes = Array.isArray(value) ? value : [];

  async function subirACloudinary(file) {
    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'hokyimage';

    if (!cloudName) throw new Error('Falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en el .env');

    const formData = new FormData();
    formData.append('file',           file);
    formData.append('upload_preset',  uploadPreset);
    formData.append('folder',         folder);

    const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body:   formData,
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message ?? 'Error al subir imagen');

    return data.secure_url;
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    e.target.value = '';

    if (imagenes.length + files.length > maxImagenes) {
      setError(`Máximo ${maxImagenes} imágenes por producto`);
      return;
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      setError('El tamaño total no puede superar 50MB');
      return;
    }

    setSubiendo(true);
    setError('');
    setProgreso(0);

    const urls    = [];
    const errores = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        errores.push(`${file.name}: no es una imagen`);
        continue;
      }
      // ← Cambiado de 5MB a 10MB
      if (file.size > 50 * 1024 * 1024) {
        errores.push(`${file.name}: supera 50MB`);
        continue;
      }

      try {
        const url = await subirACloudinary(file);
        urls.push(url);
        setProgreso(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        errores.push(`${file.name}: ${err.message}`);
      }
    }

    if (urls.length > 0)    onChange([...imagenes, ...urls]);
    if (errores.length > 0) setError(errores.join(' · '));

    setSubiendo(false);
    setProgreso(0);
  }

  function eliminar(index) {
    onChange(imagenes.filter((_, i) => i !== index));
  }

  function setPrincipal(index) {
    const copia = [...imagenes];
    const [img] = copia.splice(index, 1);
    onChange([img, ...copia]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Imágenes del producto</span>
        {imagenes.length > 0 && (
          <span style={{ fontSize: 12, color: '#888' }}>{imagenes.length} / {maxImagenes}</span>
        )}
      </div>

      <label
        htmlFor="img-upload"
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            12,
          padding:        32,
          borderRadius:   12,
          border:         `2px dashed ${subiendo ? '#111' : '#ddd'}`,
          background:     subiendo ? '#f7f7f7' : '#fafafa',
          cursor:         imagenes.length >= maxImagenes ? 'not-allowed' : 'pointer',
          textAlign:      'center',
          transition:     'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { if (!subiendo) e.currentTarget.style.borderColor = '#111'; }}
        onMouseLeave={e => { if (!subiendo) e.currentTarget.style.borderColor = '#ddd'; }}
      >
        <input
          id="img-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={subiendo || imagenes.length >= maxImagenes}
          style={{ display: 'none' }}
        />

        {subiendo ? (
          <>
            <Loader2 size={36} style={{ color: '#111', animation: 'spin 1s linear infinite' }} />
            <div style={{ width: 200 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>
                Subiendo... {progreso}%
              </p>
              <div style={{ height: 4, borderRadius: 2, background: '#e5e5e5', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: '#111',
                  width: `${progreso}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload size={20} color="#888" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>
                Hacé click para subir imágenes
              </p>
              <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                PNG, JPG, WebP · Máx. 50MB por imagen · Hasta {maxImagenes} fotos
              </p>
            </div>
          </>
        )}
      </label>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: '#fff5f5', border: '1px solid #fecaca',
          borderRadius: 8, padding: '10px 14px',
        }}>
          <AlertCircle size={14} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {imagenes.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 10,
        }}>
          {imagenes.map((url, index) => (
            <div key={url} style={{ position: 'relative' }}
              onMouseEnter={e => e.currentTarget.querySelector('.overlay').style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.querySelector('.overlay').style.opacity = '0'}
            >
              <div style={{
                position:     'relative',
                height:       90,
                borderRadius: 10,
                overflow:     'hidden',
                border:       index === 0 ? '2px solid #111' : '2px solid #e5e5e5',
              }}>
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {index === 0 && (
                  <div style={{
                    position:       'absolute', bottom: 0, left: 0, right: 0,
                    background:     'rgba(0,0,0,0.75)',
                    display:        'flex', alignItems: 'center', justifyContent: 'center',
                    gap:            4, padding: '3px 0',
                  }}>
                    <CheckCircle2 size={9} color="#fff" />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
                      PRINCIPAL
                    </span>
                  </div>
                )}
                <div className="overlay" style={{
                  position:   'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  opacity:    0, transition: 'opacity 0.2s',
                  display:    'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {index !== 0 && (
                    <button type="button" onClick={() => setPrincipal(index)} title="Poner como principal"
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#fff', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <ImageIcon size={13} color="#111" />
                    </button>
                  )}
                  <button type="button" onClick={() => eliminar(index)} title="Eliminar"
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#ef4444', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <X size={13} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imagenes.length === 0 && !subiendo && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <ImageIcon size={36} color="#ddd" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>
            Sin imágenes · La primera que subas será la principal
          </p>
        </div>
      )}
    </div>
  );
}