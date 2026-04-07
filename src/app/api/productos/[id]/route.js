// ══════════════════════════════════════════════════════════════
// src/app/api/productos/[id]/route.js
// ══════════════════════════════════════════════════════════════
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizarImagenes(producto) {
  let imagenes = [];
  if (Array.isArray(producto.imagenes)) {
    imagenes = producto.imagenes;
  } else if (typeof producto.imagenes === "string" && producto.imagenes.length > 0) {
    if (producto.imagenes.startsWith("{")) {
      imagenes = producto.imagenes
        .replace(/^\{/, "").replace(/\}$/, "").split(",")
        .map((s) => s.replace(/^"/, "").replace(/"$/, "").trim())
        .filter(Boolean);
    } else if (producto.imagenes.startsWith("[")) {
      try { imagenes = JSON.parse(producto.imagenes); } catch {}
    } else if (producto.imagenes.startsWith("http")) {
      imagenes = [producto.imagenes];
    }
  }
  const validas = imagenes.filter(
    (url) => url && typeof url === "string" && url.startsWith("http")
  );
  if (validas.length === 0 && producto.imagen?.startsWith("http")) {
    validas.push(producto.imagen);
  }
  return { ...producto, imagenes: validas };
}

export async function GET(request, context) {
  try {
    const params    = await context.params;
    const productId = params.id;

    if (!productId)
      return Response.json({ error: "ID de producto inválido" }, { status: 400 });

    const producto = await prisma.producto.findFirst({
      where:   { id: productId, activo: true },
      include: {
        categoria: { select: { id: true, nombre: true } },
        variantes: {
          where:   { activo: true },
          orderBy: [{ talle: "asc" }, { color: "asc" }],
          select:  { id: true, talle: true, color: true, stock: true, precio: true },
        },
      },
    });

    if (!producto)
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });

    return Response.json(normalizarImagenes(producto));
  } catch (error) {
    console.error("[GET /api/productos/:id]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
