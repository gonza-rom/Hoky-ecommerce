// src/app/api/admin/categorias/route.js
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where:   { activo: true },
      select:  { id: true, nombre: true, descripcion: true, imagen: true, orden: true,
        _count: { select: { productos: { where: { activo: true } } } } },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json({ ok: true, data: categorias });
  } catch (error) {
    console.error("[GET /api/admin/categorias]", error);
    return NextResponse.json({ ok: false, error: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nombre, descripcion, imagen, orden } = await req.json();
    if (!nombre?.trim())
      return NextResponse.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });

    const categoria = await prisma.categoria.create({
      data: { nombre: nombre.trim(), descripcion: descripcion?.trim() || null, imagen: imagen || null, orden: orden ?? 0 },
    });
    revalidateTag("categorias");
    return NextResponse.json({ ok: true, data: categoria }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002")
      return NextResponse.json({ ok: false, error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    console.error("[POST /api/admin/categorias]", error);
    return NextResponse.json({ ok: false, error: "Error al crear categoría" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";