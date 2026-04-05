// src/middleware.js
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rutas que requieren login de CLIENTE
const RUTAS_PROTEGIDAS_CLIENTE = ["/cuenta"];

// Rutas que requieren estar SIN sesión (no mostrar login si ya está logueado)
const RUTAS_SOLO_PUBLICAS = ["/auth/login", "/auth/registro"];

// Rutas del admin (tienen su propia protección básica)
const RUTAS_ADMIN = ["/admin"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Dejar pasar estáticos, API pública y admin
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/admin") ||     // admin tiene auth propia
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/productos") ||
    pathname.startsWith("/api/categorias") ||
    pathname.includes(".")                   // archivos estáticos
  ) {
    return NextResponse.next();
  }

  // Refrescar sesión de Supabase (mantiene el token vivo)
  const { supabaseResponse, user } = await updateSession(request);

  // Rutas de cuenta → requieren login
  if (RUTAS_PROTEGIDAS_CLIENTE.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Si ya está logueado y va a login/registro → redirigir a cuenta
  if (RUTAS_SOLO_PUBLICAS.some((r) => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL("/cuenta", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};