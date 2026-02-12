import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  try {
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

    // ✅ Normalizar: asegurar que imagenes siempre sea un array
    // y filtrar solo URLs válidas (no data URIs ni null)
    const productoNormalizado = {
      ...producto,
      imagenes: Array.isArray(producto.imagenes)
        ? producto.imagenes.filter(url => url && url.startsWith('http'))
        : [],
    };

    return Response.json(productoNormalizado);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}