// src/app/api/admin/productos/[id]/variantes/route.js
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;

    const producto = await prisma.producto.findFirst({
      where:  { id, activo: true },
      select: { id: true },
    });
    if (!producto)
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });

    const variantes = await prisma.productoVariante.findMany({
      where:   { productoId: id },
      orderBy: [{ talle: "asc" }, { color: "asc" }],
    });

    return NextResponse.json({ ok: true, data: variantes });
  } catch (error) {
    console.error("[GET /api/admin/productos/:id/variantes]", error);
    return NextResponse.json({ ok: false, error: "Error al obtener variantes" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";