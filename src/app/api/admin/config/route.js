// src/app/api/admin/config/route.js
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

const CONFIG_ID = 'hoky-config'; // ID fijo — solo existe un registro

// ── GET /api/admin/config ──────────────────────────────────────────────────
export async function GET() {
  try {
    const config = await prisma.configTienda.findFirst({
      where: { id: CONFIG_ID },
    });
    return NextResponse.json({ ok: true, data: config ?? null });
  } catch (error) {
    console.error('[GET /api/admin/config]', error);
    return NextResponse.json({ ok: false, error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// ── POST /api/admin/config — upsert ───────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      mpPublicKey,
      mpAccessToken,
      mpWebhookSecret,
      costoEnvioBase,
      envioGratisDesde,
      zonaEnvio,
      montoMinimo,
      permitirRetiro,
      direccionLocal,
      horarioLocal,
      whatsapp,
      instagram,
      email,
      bannerTexto,
      politicaEnvio,
      politicaCambios,
    } = body;

    const data = {
      mpPublicKey:      mpPublicKey?.trim()     || null,
      mpWebhookSecret:  mpWebhookSecret?.trim() || null,
      costoEnvioBase:   costoEnvioBase  != null ? Number(costoEnvioBase)  : 0,
      envioGratisDesde: envioGratisDesde != null && envioGratisDesde !== ''
                          ? Number(envioGratisDesde)
                          : null,
      zonaEnvio:        zonaEnvio?.trim()        || null,
      montoMinimo:      montoMinimo != null ? Number(montoMinimo) : 0,
      permitirRetiro:   permitirRetiro ?? true,
      direccionLocal:   direccionLocal?.trim()   || null,
      horarioLocal:     horarioLocal?.trim()     || null,
      whatsapp:         whatsapp?.trim()         || null,
      instagram:        instagram?.trim()        || null,
      email:            email?.trim()            || null,
      bannerTexto:      bannerTexto?.trim()      || null,
      politicaEnvio:    politicaEnvio?.trim()    || null,
      politicaCambios:  politicaCambios?.trim()  || null,
    };

    // Solo actualizar mpAccessToken si viene un valor nuevo (no vacío)
    // para no sobreescribir el token guardado con un string vacío
    if (mpAccessToken?.trim()) {
      data.mpAccessToken = mpAccessToken.trim();
    }

    const config = await prisma.configTienda.upsert({
      where:  { id: CONFIG_ID },
      update: data,
      create: { id: CONFIG_ID, ...data },
    });

    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    console.error('[POST /api/admin/config]', error);
    return NextResponse.json({ ok: false, error: 'Error al guardar configuración' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';