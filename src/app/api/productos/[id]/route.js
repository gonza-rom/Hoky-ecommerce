// ══════════════════════════════════════════════════════════════
// src/app/api/productos/[id]/route.js
// ══════════════════════════════════════════════════════════════
import { prisma, TENANT_ID } from "@/lib/prisma";
 
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
  const imagenesValidas = imagenes.filter(
    (url) => url && typeof url === "string" && url.startsWith("http")
  );
  if (imagenesValidas.length === 0 && producto.imagen?.startsWith("http")) {
    imagenesValidas.push(producto.imagen);
  }
  return { ...producto, imagenes: imagenesValidas };
}
 
export async function GET(request, context) {
  try {
    const params = await context.params;
    const productId = params.id; // DevHub usa cuid (string), no parseInt
 
    if (!productId) {
      return Response.json({ error: "ID de producto inválido" }, { status: 400 });
    }
 
    const producto = await prisma.producto.findFirst({
      where: {
        id: productId,
        tenantId: TENANT_ID, // ← seguridad: no puede pedir productos de otro tenant
        activo: true,
      },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
 
    if (!producto) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }
 
    return Response.json(normalizarImagenes(producto));
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
 