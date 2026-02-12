import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
      include: {
        _count: {
          select: {
            productos: {
              where: {
                stock: {
                  gt: 0,
                },
              },
            },
          },
        },
      },
    });

    return Response.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
