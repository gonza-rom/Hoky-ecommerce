// src/middleware.js
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'hokyindumentaria@gmail.com';

// Rutas que requieren login de CLIENTE
const RUTAS_PROTEGIDAS_CLIENTE = ['/cuenta'];

// Rutas que requieren ser ADMIN
const RUTAS_ADMIN = ['/admin'];

// Rutas solo para usuarios NO autenticados
const RUTAS_SOLO_PUBLICAS = ['/auth/login', '/auth/registro'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Dejar pasar sin procesar ───────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||    // webhooks externos
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/productos') ||
    pathname.startsWith('/api/categorias') ||
    pathname.startsWith('/api/checkout') ||
    pathname.includes('.')                     // archivos estáticos
  ) {
    return NextResponse.next();
  }

  // Refrescar sesión de Supabase
  const { supabaseResponse, user } = await updateSession(request);

  // ── Protección de rutas de admin ───────────────────────────────────────
  if (RUTAS_ADMIN.some(r => pathname.startsWith(r))) {
    // No autenticado → login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    // Autenticado pero no es admin → home
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── Protección de rutas de cuenta ─────────────────────────────────────
  if (RUTAS_PROTEGIDAS_CLIENTE.some(r => pathname.startsWith(r))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Redirigir usuarios ya autenticados fuera del login ────────────────
  if (RUTAS_SOLO_PUBLICAS.some(r => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL('/cuenta', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};