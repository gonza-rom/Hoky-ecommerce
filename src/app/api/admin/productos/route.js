// src/app/api/admin/productos/route.js
import { NextResponse }  from "next/server";
import { prisma }        from "@/lib/prisma";
import { revalidateTag } from "next/cache";

function toNull(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "20"));
    const skip     = (page - 1) * pageSize;

    const busqueda    = searchParams.get("q") ?? "";
    const categoriaId = searchParams.get("categoriaId") ?? "";
    const stockBajo   = searchParams.get("stockBajo") === "true";
    const ordenar     = searchParams.get("ordenar") ?? "nombre";

    const where = { activo: true };

    if (stockBajo) where.stock = { lte: 1 };

    // ── Filtro por categoría: incluye subcategorías ──────────
    if (categoriaId === "sin-categoria") {
      where.categoriaId = { equals: null };
    } else if (categoriaId) {
      // Buscar si la categoría tiene hijos
      const cat = await prisma.categoria.findFirst({
        where:  { id: categoriaId },
        select: { id: true, hijos: { select: { id: true } } },
      });

      if (cat?.hijos?.length > 0) {
        // Es una categoría raíz con subcategorías → incluir ella + sus hijos
        const ids = [categoriaId, ...cat.hijos.map(h => h.id)];
        where.categoriaId = { in: ids };
      } else {
        // Es una subcategoría o categoría sin hijos → filtro exacto
        where.categoriaId = categoriaId;
      }
    }

    if (busqueda.trim()) {
      where.OR = [
        { nombre:         { contains: busqueda, mode: "insensitive" } },
        { codigoProducto: { contains: busqueda, mode: "insensitive" } },
        { codigoBarras:   { contains: busqueda, mode: "insensitive" } },
      ];
    }

    let orderBy = { nombre: "asc" };
    if (ordenar === "recientes")   orderBy = { createdAt: "desc" };
    if (ordenar === "precio-asc")  orderBy = { precio: "asc" };
    if (ordenar === "precio-desc") orderBy = { precio: "desc" };
    if (ordenar === "stock-asc")   orderBy = { stock: "asc" };

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        select: {
          id: true, nombre: true, descripcion: true,
          codigoProducto: true, codigoBarras: true,
          precio: true, precioAnterior: true, costo: true,
          descuentoEfectivo: true,
          stock: true, stockMinimo: true, unidad: true,
          imagen: true, imagenes: true,
          activo: true, destacado: true, tieneVariantes: true,
          categoriaId: true,
          categoria: { select: { id: true, nombre: true, parentId: true } },
          createdAt: true,
        },
        orderBy, skip, take: pageSize,
      }),
      prisma.producto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      ok: true,
      data: productos,
      pagination: { page, pageSize, total, totalPages,
        hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (error) {
    console.error("[GET /api/admin/productos]", error);
    return NextResponse.json({ ok: false, error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      nombre, descripcion, precio, precioAnterior, costo,
      descuentoEfectivo, stock, stockMinimo, unidad,
      imagen, imagenes, categoriaId,
      codigoBarras, codigoProducto,
      destacado = false, tieneVariantes = false,
      variantes = [],
    } = body;

    if (!nombre?.trim())
      return NextResponse.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
    if (!precio || parseFloat(precio) <= 0)
      return NextResponse.json({ ok: false, error: "El precio debe ser mayor a 0" }, { status: 400 });

    const codigoPFinal      = toNull(codigoProducto);
    const codigoBarrasFinal = toNull(codigoBarras);

    const [dupCodigo, dupBarras] = await Promise.all([
      codigoPFinal
        ? prisma.producto.findFirst({ where: { codigoProducto: codigoPFinal, activo: true }, select: { nombre: true } })
        : null,
      codigoBarrasFinal
        ? prisma.producto.findFirst({ where: { codigoBarras: codigoBarrasFinal, activo: true }, select: { nombre: true } })
        : null,
    ]);

    if (dupCodigo)
      return NextResponse.json({ ok: false, error: `El código "${codigoPFinal}" ya está en uso por: ${dupCodigo.nombre}` }, { status: 409 });
    if (dupBarras)
      return NextResponse.json({ ok: false, error: `El código de barras ya está en uso por: ${dupBarras.nombre}` }, { status: 409 });

    const imagenPrincipal = toNull(imagen) ?? (Array.isArray(imagenes) && imagenes[0]) ?? null;
    const stockFinal = tieneVariantes
      ? variantes.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)
      : parseInt(stock) || 0;

    const producto = await prisma.$transaction(async (tx) => {
      const p = await tx.producto.create({
        data: {
          nombre:            nombre.trim(),
          descripcion:       toNull(descripcion),
          precio:            parseFloat(precio),
          precioAnterior:    precioAnterior ? parseFloat(precioAnterior) : null,
          costo:             costo ? parseFloat(costo) : null,
          descuentoEfectivo: descuentoEfectivo != null ? parseFloat(descuentoEfectivo) : 10,
          stock:             stockFinal,
          stockMinimo:       parseInt(stockMinimo) || 1,
          unidad:            toNull(unidad),
          imagen:            imagenPrincipal,
          imagenes:          Array.isArray(imagenes) ? imagenes : [],
          categoriaId:       toNull(categoriaId),
          codigoProducto:    codigoPFinal,
          codigoBarras:      codigoBarrasFinal,
          destacado,
          tieneVariantes,
        },
        include: { categoria: { select: { id: true, nombre: true } } },
      });

      if (tieneVariantes && variantes.length > 0) {
        await tx.productoVariante.createMany({
          data: variantes.map((v) => ({
            productoId: p.id,
            talle:      v.talle || null,
            color:      v.color?.trim() || "",
            stock:      parseInt(v.stock) || 0,
            precio:     v.precio ? parseFloat(v.precio) : null,
            activo:     true,
          })),
        });
      }
      return p;
    });

    revalidateTag("productos");
    revalidateTag("categorias");
    return NextResponse.json({ ok: true, data: producto }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      const msg = field === "codigoBarras" ? "El código de barras ya existe"
                : field === "codigoProducto" ? "El código interno ya existe"
                : "Ya existe un producto con ese código";
      return NextResponse.json({ ok: false, error: msg }, { status: 409 });
    }
    console.error("[POST /api/admin/productos]", error);
    return NextResponse.json({ ok: false, error: "Error al crear producto" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";