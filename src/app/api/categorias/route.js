// ══════════════════════════════════════════════════════════════
// src/app/api/categorias/route.js
// ══════════════════════════════════════════════════════════════
// NOTA: Este archivo va en src/app/api/categorias/route.js
// Se muestra aquí junto para referencia.
 

import { prisma, TENANT_ID } from "@/lib/prisma";
 
export const revalidate = 0;
 
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { tenantId: TENANT_ID },  // ← único cambio vs JMR
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            productos: {
              where: {
                tenantId: TENANT_ID,
                activo: true,
                stock: { gt: 0 },
              },
            },
          },
        },
      },
    });
 
    return Response.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

