'use client';
// src/app/auth/reset-password/page.js

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const router   = useRouter();
  const supabase = createClient();

  const [password,     setPassword]     = useState('');
  const [confirmar,    setConfirmar]    = useState('');
  const [verPass,      setVerPass]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [exito,        setExito]        = useState(false);
  const [sesionLista,  setSesionLista]  = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);

  useEffect(() => {
    // Supabase envía el token en el hash de la URL:
    // /auth/reset-password#access_token=xxx&refresh_token=yyy&type=recovery
    // Hay que parsearlo manualmente y llamar a setSession() para que
    // el cliente lo reconozca — el evento onAuthStateChange solo no alcanza.
    const hash = window.location.hash;

    if (!hash) {
      setLinkInvalido(true);
      return;
    }

    const params       = new URLSearchParams(hash.replace('#', ''));
    const accessToken  = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type         = params.get('type');

    if (!accessToken || type !== 'recovery') {
      setLinkInvalido(true);
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: err }) => {
        if (err) {
          setLinkInvalido(true);
        } else {
          setSesionLista(true);
          // Limpiar el hash para que el token no quede expuesto en la URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }
      setExito(true);
      setTimeout(() => router.push('/cuenta'), 2000);
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // ── Link inválido o expirado ───────────────────────────────
  if (linkInvalido) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <AlertCircle size={40} color="#f59e0b" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{ ...s.titulo, marginBottom: 8 }}>Link inválido o expirado</h1>
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 }}>
            El link de recuperación ya fue usado o expiró. Podés solicitar uno nuevo desde el login.
          </p>
          <Link href="/auth/login" style={{
            display: 'block', textAlign: 'center', background: '#111', color: '#fff',
            padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none',
          }}>
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  // ── Éxito ──────────────────────────────────────────────────
  if (exito) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{ ...s.titulo, marginBottom: 8 }}>¡Contraseña actualizada!</h1>
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
            Redirigiendo a tu cuenta...
          </p>
        </div>
      </div>
    );
  }

  // ── Formulario ─────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.15em', color: '#111', margin: 0, textTransform: 'uppercase' }}>HOKY</p>
            <p style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.2em', margin: '2px 0 0', textTransform: 'uppercase' }}>Indumentaria</p>
          </Link>
        </div>

        <h1 style={s.titulo}>Nueva contraseña</h1>
        <p style={s.subtitulo}>Ingresá tu nueva contraseña para continuar</p>

        {/* Spinner mientras se procesa el hash */}
        {!sesionLista && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Loader2 size={28} color="#ccc" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#aaa', marginTop: 12 }}>Verificando el link...</p>
          </div>
        )}

        {sesionLista && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={s.label}>Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={verPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  style={{ ...s.input, paddingRight: 40 }}
                  autoFocus
                />
                <button type="button" onClick={() => setVerPass(!verPass)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
                }}>
                  {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={s.label}>Confirmar contraseña</label>
              <input
                type={verPass ? 'text' : 'password'}
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
                style={s.input}
              />
            </div>

            {password.length > 0 && (
              <div>
                <div style={{ height: 4, borderRadius: 2, background: '#e5e5e5', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: password.length >= 12 ? '100%' : password.length >= 8 ? '66%' : '33%',
                    background: password.length >= 12 ? '#16a34a' : password.length >= 8 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                  {password.length >= 12 ? 'Contraseña fuerte' : password.length >= 8 ? 'Contraseña aceptable' : 'Contraseña débil'}
                </p>
              </div>
            )}

            {error && (
              <p style={{ fontSize: 13, color: '#ef4444', margin: 0, textAlign: 'center' }}>{error}</p>
            )}

            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px', border: 'none', borderRadius: 8,
              background: '#111', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, marginTop: 4,
            }}>
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                : 'Actualizar contraseña'
              }
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 }}>
          <Link href="/auth/login" style={{ color: '#111', fontWeight: 700, textDecoration: 'none' }}>
            Volver al login
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Inter', sans-serif" },
  card:      { background: '#fff', borderRadius: 16, border: '1px solid #e8e5e0', padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  titulo:    { fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 4px', letterSpacing: '-0.02em', textAlign: 'center' },
  subtitulo: { fontSize: 13, color: '#888', margin: '0 0 24px', textAlign: 'center' },
  label:     { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 },
  input:     { width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111', background: '#fff' },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}