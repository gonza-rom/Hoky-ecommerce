// src/app/api/admin/productos/importar/route.js
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";

function parsearCSV(texto) {
  const lineas = texto.split(/\r?\n/).filter((l) => l.trim());
  if (lineas.length < 2) return [];

  const SEP = lineas[0].includes(";") ? ";" : ",";
  const encabezados = lineas[0]
    .split(SEP)
    .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/ /g, "_"));

  return lineas.slice(1).map((linea) => {
    const valores = [];
    let actual = "", enComillas = false;
    for (const c of linea) {
      if (c === '"')                     { enComillas = !enComillas; continue; }
      if (c === SEP && !enComillas)      { valores.push(actual.trim()); actual = ""; continue; }
      actual += c;
    }
    valores.push(actual.trim());
    const fila = {};
    encabezados.forEach((h, i) => { fila[h] = valores[i] ?? ""; });
    return fila;
  });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const archivo  = formData.get("archivo");
    if (!archivo)
      return NextResponse.json({ ok: false, error: "No se recibió archivo" }, { status: 400 });

    const texto = await archivo.text();
    const filas = parsearCSV(texto);
    if (!filas.length)
      return NextResponse.json({ ok: false, error: "El archivo está vacío o mal formateado" }, { status: 400 });

    if (!("nombre" in filas[0]) || !("precio" in filas[0]))
      return NextResponse.json({ ok: false, error: "El CSV debe tener las columnas: nombre, precio" }, { status: 400 });

    // Mapear categorías por nombre
    const categorias = await prisma.categoria.findMany({ select: { id: true, nombre: true } });
    const catMap = new Map(categorias.map((c) => [c.nombre.toLowerCase(), c.id]));

    const resultado = { creados: 0, errores: 0, detallesError: [] };

    for (let i = 0; i < filas.length; i++) {
      const fila   = filas[i];
      const linea  = i + 2;
      const nombre = fila.nombre?.trim();
      const precio = parseFloat(fila.precio ?? "");

      if (!nombre) {
        resultado.errores++;
        resultado.detallesError.push(`Fila ${linea}: nombre vacío`);
        continue;
      }
      if (isNaN(precio) || precio <= 0) {
        resultado.errores++;
        resultado.detallesError.push(`Fila ${linea}: precio inválido (${fila.precio})`);
        continue;
      }

      const categoriaId = fila.categoria ? catMap.get(fila.categoria.toLowerCase()) ?? null : null;
      const destacado   = fila.destacado?.toLowerCase() === "si";

      try {
        await prisma.producto.create({
          data: {
            nombre,
            precio,
            precioAnterior: fila.precio_anterior ? parseFloat(fila.precio_anterior) : null,
            costo:          fila.costo       ? parseFloat(fila.costo)       : null,
            stock:          fila.stock        ? parseInt(fila.stock)         : 0,
            stockMinimo:    fila.stock_minimo ? parseInt(fila.stock_minimo)  : 1,
            unidad:         fila.unidad       || null,
            descripcion:    fila.descripcion  || null,
            codigoProducto: fila.codigo_producto || null,
            codigoBarras:   fila.codigo_barras   || null,
            categoriaId,
            destacado,
          },
        });
        resultado.creados++;
      } catch (err) {
        resultado.errores++;
        resultado.detallesError.push(`Fila ${linea}: ${err.message}`);
      }
    }

    return NextResponse.json({ ok: true, ...resultado });
  } catch (error) {
    console.error("[POST /api/admin/productos/importar]", error);
    return NextResponse.json({ ok: false, error: "Error al importar" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";