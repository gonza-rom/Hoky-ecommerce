// ══════════════════════════════════════════════════════════════
// src/app/api/categorias/route.js
// API pública — tienda online Hoky (sin tenantId)
// ══════════════════════════════════════════════════════════════
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
export const dynamic    = "force-dynamic";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where:   { activo: true },
      orderBy: { orden: "asc" },
      include: {
        _count: {
          select: {
            productos: {
              where: { activo: true, stock: { gt: 0 } },
            },
          },
        },
      },
    });

    return Response.json(categorias);
  } catch (error) {
    console.error("[GET /api/categorias]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}