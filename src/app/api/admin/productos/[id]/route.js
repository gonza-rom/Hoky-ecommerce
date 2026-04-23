// src/app/api/admin/productos/[id]/route.js
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const producto = await prisma.producto.findFirst({
      where: { id, activo: true },
      include: {
        categoria: { select: { id: true, nombre: true } },
        variantes: {
          where:   { activo: true },
          orderBy: [{ talle: "asc" }, { color: "asc" }],
        },
      },
    });
    if (!producto)
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, data: producto });
  } catch (error) {
    console.error("[GET /api/admin/productos/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;

    const existente = await prisma.producto.findFirst({ where: { id } });
    if (!existente)
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });

    const body = await req.json();
    const {
      nombre, descripcion, codigoProducto, codigoBarras,
      precio, precioAnterior, costo, stock, stockMinimo, unidad,
      imagen, imagenes, categoriaId,
      destacado, tieneVariantes = false, variantes = [],
      descuentoEfectivo, // ← ahora se desestructura
    } = body;

    if (!nombre?.trim() || !precio || parseFloat(precio) <= 0)
      return NextResponse.json({ ok: false, error: "Nombre y precio son requeridos" }, { status: 400 });

    if (codigoProducto?.trim()) {
      const dup = await prisma.producto.findFirst({
        where: { codigoProducto: codigoProducto.trim(), activo: true, NOT: { id } },
      });
      if (dup)
        return NextResponse.json({ ok: false, error: `Código "${codigoProducto}" ya está en uso por: ${dup.nombre}` }, { status: 409 });
    }
    if (codigoBarras?.trim()) {
      const dup = await prisma.producto.findFirst({
        where: { codigoBarras: codigoBarras.trim(), activo: true, NOT: { id } },
      });
      if (dup)
        return NextResponse.json({ ok: false, error: `Código de barras ya está en uso por: ${dup.nombre}` }, { status: 409 });
    }

    const stockFinal = tieneVariantes
      ? variantes.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)
      : parseInt(stock) || 0;

    // Calcular precios derivados
    const precioBase = parseFloat(precio);
    const descuento  = descuentoEfectivo != null ? parseFloat(descuentoEfectivo) : (existente.descuentoEfectivo ?? 10);
    const precioConDesc = Math.round(precioBase * (1 - descuento / 100));

    const producto = await prisma.$transaction(async (tx) => {
      const p = await tx.producto.update({
        where: { id },
        data: {
          nombre:             nombre.trim(),
          descripcion:        descripcion?.trim() || null,
          codigoProducto:     codigoProducto?.trim() || null,
          codigoBarras:       codigoBarras?.trim() || null,
          precio:             precioBase,
          precioAnterior:     precioAnterior ? parseFloat(precioAnterior) : null,
          costo:              costo ? parseFloat(costo) : null,
          descuentoEfectivo:  descuento,
          precioEfectivo:     precioConDesc,
          precioTransferencia: precioConDesc,
          precioTarjeta:      precioBase,
          stock:              stockFinal,
          stockMinimo:        parseInt(stockMinimo) || 1,
          unidad:             unidad?.trim() || null,
          imagen:             imagen || (Array.isArray(imagenes) && imagenes[0]) || null,
          imagenes:           Array.isArray(imagenes) ? imagenes : [],
          categoriaId:        categoriaId || null,
          destacado:          destacado ?? existente.destacado,
          tieneVariantes,
        },
        include: { categoria: { select: { id: true, nombre: true } } },
      });

      if (tieneVariantes && variantes.length > 0) {
        const idsEnviados = variantes.filter((v) => v.id).map((v) => v.id);
        if (idsEnviados.length > 0) {
          await tx.productoVariante.deleteMany({
            where: { productoId: id, id: { notIn: idsEnviados } },
          });
        }
        for (const v of variantes) {
          if (v.id) {
            await tx.productoVariante.update({
              where: { id: v.id },
              data: {
                talle:  v.talle || null,
                color:  v.color?.trim() || "",
                stock:  parseInt(v.stock) || 0,
                precio: v.precio ? parseFloat(v.precio) : null,
                activo: v.activo ?? true,
              },
            });
          } else {
            await tx.productoVariante.create({
              data: {
                productoId: id,
                talle:      v.talle || null,
                color:      v.color?.trim() || "",
                stock:      parseInt(v.stock) || 0,
                precio:     v.precio ? parseFloat(v.precio) : null,
                activo:     true,
              },
            });
          }
        }
      } else if (!tieneVariantes) {
        await tx.productoVariante.updateMany({
          where: { productoId: id },
          data:  { activo: false },
        });
      }

      return p;
    });

    revalidateTag("productos");
    return NextResponse.json({ ok: true, data: producto });
  } catch (error) {
    if (error.code === "P2002")
      return NextResponse.json({ ok: false, error: "Ya existe un producto con ese código" }, { status: 409 });
    console.error("[PUT /api/admin/productos/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    const existente = await prisma.producto.findFirst({ where: { id } });
    if (!existente)
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    await prisma.producto.update({
      where: { id },
      data:  { activo: false, codigoProducto: null, codigoBarras: null },
    });
    revalidateTag("productos");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/productos/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al eliminar producto" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";