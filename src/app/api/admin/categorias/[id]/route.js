// src/app/api/admin/categorias/[id]/route.js
import { NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { nombre, descripcion, imagen, orden, parentId } = await req.json();
    if (!nombre?.trim())
      return NextResponse.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });

    // No permitir que una categoría sea su propio padre
    if (parentId === id)
      return NextResponse.json({ ok: false, error: "Una categoría no puede ser su propio padre" }, { status: 400 });

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nombre:      nombre.trim(),
        descripcion: descripcion?.trim() || null,
        imagen:      imagen || null,
        orden:       orden ?? 0,
        parentId:    parentId || null,
      },
    });
    revalidateTag("categorias");
    return NextResponse.json({ ok: true, data: categoria });
  } catch (error) {
    if (error.code === "P2002")
      return NextResponse.json({ ok: false, error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    console.error("[PUT /api/admin/categorias/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;

    // Mover productos hijos a sin categoría antes de eliminar
    await prisma.producto.updateMany({
      where: { categoriaId: id },
      data:  { categoriaId: null },
    });

    // Mover subcategorías a raíz
    await prisma.categoria.updateMany({
      where: { parentId: id },
      data:  { parentId: null },
    });

    await prisma.categoria.update({
      where: { id },
      data:  { activo: false },
    });

    revalidateTag("categorias");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/categorias/:id]", error);
    return NextResponse.json({ ok: false, error: "Error al eliminar" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";