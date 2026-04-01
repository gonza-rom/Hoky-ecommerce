// src/app/api/productos/route.js
import { prisma, TENANT_ID } from "@/lib/prisma";

export const revalidate = 0;

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12")));
    const skip     = (page - 1) * pageSize;

    const busqueda  = searchParams.get("busqueda")?.trim()  || "";
    const categoria = searchParams.get("categoria")?.trim() || "";
    const ordenar   = searchParams.get("ordenar")           || "";

    const precioMinParam = searchParams.get("precioMin");
    const precioMaxParam = searchParams.get("precioMax");
    const precioMin = precioMinParam !== null ? parseFloat(precioMinParam) : null;
    const precioMax = precioMaxParam !== null ? parseFloat(precioMaxParam) : null;

    const excludeId = searchParams.get("exclude") ? searchParams.get("exclude") : null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : null;

    // ── Rango de precios ──────────────────────────────────────────────────
    if (searchParams.get("rangoPrecios") === "true") {
      const [minResult, maxResult] = await Promise.all([
        prisma.producto.findFirst({
          where: { tenantId: TENANT_ID, activo: true, stock: { gt: 0 } },
          orderBy: { precio: "asc" },
          select: { precio: true },
        }),
        prisma.producto.findFirst({
          where: { tenantId: TENANT_ID, activo: true, stock: { gt: 0 } },
          orderBy: { precio: "desc" },
          select: { precio: true },
        }),
      ]);
      return Response.json({
        min: Math.floor(minResult?.precio ?? 0),
        max: Math.ceil(maxResult?.precio ?? 100000),
      });
    } 

    const destacados = searchParams.get("destacados") === "true";

    // ── WHERE — siempre filtra por tenantId ───────────────────────────────
    const where = {
      tenantId: TENANT_ID,   // ← LA diferencia con JMR
      activo: true,
      stock: { gt: 0 },
    };

    if (categoria)  where.categoriaId = categoria;   // DevHub usa String (cuid), no Int
    if (excludeId)  where.id = { not: excludeId };

    if (busqueda) {
      where.OR = [
        { nombre:         { contains: busqueda, mode: "insensitive" } },
        { descripcion:    { contains: busqueda, mode: "insensitive" } },
        { codigoProducto: { contains: busqueda, mode: "insensitive" } },
      ];
    }

    if (precioMin !== null || precioMax !== null) {
      where.precio = {};
      if (precioMin !== null) where.precio.gte = precioMin;
      if (precioMax !== null) where.precio.lte = precioMax;
    }

    // ── ORDER BY ──────────────────────────────────────────────────────────
    let orderBy = [{ imagen: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    if (ordenar === "precio-asc")  orderBy = [{ precio: "asc"  }];
    if (ordenar === "precio-desc") orderBy = [{ precio: "desc" }];
    if (ordenar === "nombre")      orderBy = [{ nombre: "asc"  }];
    if (ordenar === "recientes")   orderBy = [{ createdAt: "desc" }];

    const include = { categoria: true, proveedor: true };

    // ── Sin paginación (destacados o limit) ───────────────────────────────
    if (destacados || limit) {
      const productos = await prisma.producto.findMany({
        where, include, orderBy,
        take: limit ?? 8,
      });
      return Response.json(productos.map(normalizarImagenes));
    }

    // ── Paginado ──────────────────────────────────────────────────────────
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({ where, include, orderBy, skip, take: pageSize }),
      prisma.producto.count({ where }),
    ]);

    return Response.json({
      productos: productos.map(normalizarImagenes),
      pagination: {
        page, pageSize, total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error("Error al obtener productos:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; // ← AGREGAR ESTA LÍNEA