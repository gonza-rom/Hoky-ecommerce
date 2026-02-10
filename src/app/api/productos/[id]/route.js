import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  try {
    // Next.js 15+ usa await params
    const params = await context.params;
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return Response.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const producto = await prisma.producto.findUnique({
      where: {
        id: productId,
      },
      include: {
        categoria: true,
        proveedor: true,
      },
    });

    if (!producto) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return Response.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}