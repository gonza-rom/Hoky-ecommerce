'use client';
// src/app/auth/login/page.js
// CAMBIO respecto a la versión anterior:
// Después de signInWithPassword exitoso → llama a /api/auth/sync
// para crear/actualizar el Cliente en la BD.

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function Separador() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e8e5e0' }} />
      <span style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.05em' }}>O</span>
      <div style={{ flex: 1, height: 1, background: '#e8e5e0' }} />
    </div>
  );
}

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect') ?? '/cuenta';

  const [modo,     setModo]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [nombre,   setNombre]   = useState('');
  const [verPass,  setVerPass]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [loadingG, setLoadingG] = useState(false);
  const [error,    setError]    = useState('');
  const [exito,    setExito]    = useState('');

  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setExito('');

    if (!email.trim() || !password) { setError('Completá todos los campos'); return; }
    if (modo === 'registro' && !nombre.trim()) { setError('Ingresá tu nombre'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }

    setLoading(true);
    try {
      if (modo === 'registro') {
        const { error: err } = await supabase.auth.signUp({
          email:    email.trim(),
          password,
          options: {
            data: { nombre: nombre.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (err) {
          if (err.message.includes('already registered'))
            setError('Ya existe una cuenta con ese email. Iniciá sesión.');
          else setError(err.message);
          return;
        }
        setExito('¡Cuenta creada! Revisá tu email para confirmar tu cuenta antes de ingresar.');

      } else {
        // ── Login ──────────────────────────────────────────────
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(), password,
        });
        if (err) {
          if (err.message.includes('Invalid login credentials'))
            setError('Email o contraseña incorrectos');
          else if (err.message.includes('Email not confirmed'))
            setError('Confirmá tu email antes de ingresar. Revisá tu bandeja.');
          else setError(err.message);
          return;
        }

        // ── Sincronizar Cliente en la BD ───────────────────────
        try {
          await fetch('/api/auth/sync', { method: 'POST' });
        } catch {
          // No bloqueamos el login si falla el sync
        }

        router.push(redirectTo);
        router.refresh();
      }
    } catch { setError('Error de conexión. Intentá de nuevo.'); }
    finally  { setLoading(false); }
  }

  async function handleGoogle() {
    setError(''); setLoadingG(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (err) setError(err.message);
    } catch { setError('Error al conectar con Google'); }
    finally  { setLoadingG(false); }
  }

  async function handleRecuperar() {
    if (!email.trim()) { setError('Ingresá tu email para recuperar la contraseña'); return; }
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (err) setError(err.message);
      else setExito('Te enviamos un email para restablecer tu contraseña.');
    } catch { setError('Error al enviar el email'); }
    finally  { setLoading(false); }
  }

  const s = styles;

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.15em', color: '#111', margin: 0, textTransform: 'uppercase' }}>HOKY</p>
            <p style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.2em', margin: '2px 0 0', textTransform: 'uppercase' }}>Indumentaria</p>
          </Link>
        </div>

        <h1 style={s.titulo}>{modo === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</h1>
        <p style={s.subtitulo}>
          {modo === 'login' ? 'Accedé a tus pedidos y favoritos' : 'Guardá tus pedidos y direcciones de entrega'}
        </p>

        <button onClick={handleGoogle} disabled={loadingG || loading} style={s.btnGoogle}>
          {loadingG ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <GoogleIcon />}
          Continuar con Google
        </button>

        <Separador />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modo === 'registro' && (
            <div>
              <label style={s.label}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre" autoComplete="name" style={s.input} />
            </div>
          )}

          <div>
            <label style={s.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" autoComplete="email" style={s.input} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ ...s.label, marginBottom: 0 }}>Contraseña</label>
              {modo === 'login' && (
                <button type="button" onClick={handleRecuperar}
                  style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={verPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? 'Mínimo 8 caracteres' : '••••••••'}
                autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
                style={{ ...s.input, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setVerPass(!verPass)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
              }}>
                {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}
          {exito && <p style={s.exito}>{exito}</p>}

          <button type="submit" disabled={loading || loadingG} style={s.btnPrimary}>
            {loading
              ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 }}>
          {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); setExito(''); }}
            style={{ fontSize: 13, fontWeight: 700, color: '#111', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {modo === 'login' ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/productos" style={{ fontSize: 12, color: '#bbb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={12} /> Seguir comprando sin cuenta
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  page:       { minHeight: '100vh', background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Inter', sans-serif" },
  card:       { background: '#fff', borderRadius: 16, border: '1px solid #e8e5e0', padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  titulo:     { fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 4px', letterSpacing: '-0.02em', textAlign: 'center' },
  subtitulo:  { fontSize: 13, color: '#888', margin: '0 0 20px', textAlign: 'center' },
  label:      { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 },
  input:      { width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111', background: '#fff' },
  btnPrimary: { width: '100%', padding: '12px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnGoogle:  { width: '100%', padding: '11px 12px', border: '1px solid #e0dbd5', borderRadius: 8, background: '#fff', color: '#111', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  error:      { fontSize: 13, color: '#ef4444', margin: 0, textAlign: 'center' },
  exito:      { fontSize: 13, color: '#16a34a', margin: 0, textAlign: 'center' },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}