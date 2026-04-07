// src/app/api/admin/productos/exportar/route.js
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      where:   { activo: true },
      select: {
        nombre: true, codigoProducto: true, codigoBarras: true,
        precio: true, precioAnterior: true, costo: true,
        stock: true, stockMinimo: true, unidad: true,
        descripcion: true, destacado: true,
        categoria: { select: { nombre: true } },
      },
      orderBy: { nombre: "asc" },
    });

    const SEP = ";";
    const encabezado = [
      "nombre", "codigo_producto", "codigo_barras",
      "precio", "precio_anterior", "costo",
      "stock", "stock_minimo", "unidad",
      "descripcion", "categoria", "destacado",
    ];

    const filas = productos.map((p) => [
      p.nombre,
      p.codigoProducto  ?? "",
      p.codigoBarras    ?? "",
      p.precio,
      p.precioAnterior  ?? "",
      p.costo           ?? "",
      p.stock,
      p.stockMinimo,
      p.unidad          ?? "",
      (p.descripcion    ?? "").replace(/"/g, '""'),
      p.categoria?.nombre ?? "",
      p.destacado ? "si" : "no",
    ].map((v) => `"${v}"`).join(SEP));

    const BOM  = "\uFEFF";
    const csv  = BOM + [encabezado.join(SEP), ...filas].join("\n");
    const fecha = new Date().toISOString().split("T")[0];

    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="productos_hoky_${fecha}.csv"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/productos/exportar]", error);
    return NextResponse.json({ ok: false, error: "Error al exportar" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";