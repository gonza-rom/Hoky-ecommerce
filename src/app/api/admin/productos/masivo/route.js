// ═══════════════════════════════════════════════════════════════
// src/app/api/admin/productos/masivo/route.js
// ═══════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { ids, filtros, accion, valor, tipo } = body;

    let where = { activo: true };

    if (filtros) {
      if (filtros.soloStockBajo) where.stock = { lte: 1 };
      if (filtros.categoriaId === "sin-categoria") {
        where.categoriaId = { equals: null };
      } else if (filtros.categoriaId) {
        where.categoriaId = filtros.categoriaId;
      }
      if (filtros.busqueda?.trim()) {
        where.OR = [
          { nombre:         { contains: filtros.busqueda, mode: "insensitive" } },
          { codigoProducto: { contains: filtros.busqueda, mode: "insensitive" } },
        ];
      }
    } else if (ids?.length > 0) {
      where.id = { in: ids };
    } else {
      return NextResponse.json({ ok: false, error: "Debe proporcionar IDs o filtros" }, { status: 400 });
    }

    let resultado;

    switch (accion) {
      case "categoria": {
        if (valor === undefined)
          return NextResponse.json({ ok: false, error: "Debe seleccionar una opción" }, { status: 400 });
        if (valor !== null) {
          const cat = await prisma.categoria.findFirst({ where: { id: valor } });
          if (!cat)
            return NextResponse.json({ ok: false, error: "Categoría no encontrada" }, { status: 404 });
        }
        resultado = await prisma.producto.updateMany({ where, data: { categoriaId: valor ?? null } });
        break;
      }
      case "stock": {
        const valorStock = parseFloat(valor);
        if (isNaN(valorStock))
          return NextResponse.json({ ok: false, error: "Valor inválido" }, { status: 400 });

        if (tipo === "establecer") {
          resultado = await prisma.producto.updateMany({ where, data: { stock: Math.max(0, valorStock) } });
        } else if (tipo === "sumar" || tipo === "restar") {
          const productos = await prisma.producto.findMany({ where, select: { id: true, stock: true } });
          const op = tipo === "sumar" ? 1 : -1;
          await Promise.all(productos.map((p) =>
            prisma.producto.update({ where: { id: p.id }, data: { stock: Math.max(0, p.stock + valorStock * op) } })
          ));
          resultado = { count: productos.length };
        }
        break;
      }
      case "precio": {
        const valorPrecio = parseFloat(valor);
        if (isNaN(valorPrecio))
          return NextResponse.json({ ok: false, error: "Valor inválido" }, { status: 400 });

        if (tipo === "fijo") {
          resultado = await prisma.producto.updateMany({ where, data: { precio: Math.max(0, valorPrecio) } });
        } else if (tipo === "porcentaje") {
          const productos = await prisma.producto.findMany({ where, select: { id: true, precio: true } });
          await Promise.all(productos.map((p) =>
            prisma.producto.update({
              where: { id: p.id },
              data:  { precio: Math.max(0, p.precio + (p.precio * valorPrecio) / 100) },
            })
          ));
          resultado = { count: productos.length };
        }
        break;
      }
      case "destacado": {
        resultado = await prisma.producto.updateMany({ where, data: { destacado: valor === true } });
        break;
      }
      default:
        return NextResponse.json({ ok: false, error: "Acción no válida" }, { status: 400 });
    }

    revalidateTag("productos");
    return NextResponse.json({ ok: true, actualizados: resultado?.count ?? 0 });
  } catch (error) {
    console.error("[PATCH /api/admin/productos/masivo]", error);
    return NextResponse.json({ ok: false, error: "Error al procesar la acción" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";


// ═══════════════════════════════════════════════════════════════
// src/app/api/admin/productos/exportar/route.js
// ═══════════════════════════════════════════════════════════════
// import { NextResponse } from "next/server";
// import { prisma }       from "@/lib/prisma";

export async function GET_exportar() {
  // Guardado aparte — ver archivo exportar/route.js
}


// ═══════════════════════════════════════════════════════════════
// src/app/api/admin/productos/[id]/variantes/route.js
// ═══════════════════════════════════════════════════════════════
export async function GET_variantes(_req, { params }) {
  // Guardado aparte — ver archivo [id]/variantes/route.js
}