import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destacados = searchParams.get('destacados');
    const limit = searchParams.get('limit');
    const categoria = searchParams.get('categoria');
    const busqueda = searchParams.get('busqueda');

    let where = {
      stock: {
        gt: 0,
      },
    };

    if (categoria) {
      where.categoriaId = parseInt(categoria);
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
        { codigoProducto: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    let productos = await prisma.producto.findMany({
      where,
      include: {
        categoria: true,
        proveedor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ✅ Normalizar: asegurar que imagenes siempre sea un array
    // y filtrar solo URLs válidas (no data URIs)
    productos = productos.map(p => ({
      ...p,
      imagenes: Array.isArray(p.imagenes)
        ? p.imagenes.filter(url => url && url.startsWith('http'))
        : [],
    }));

    if (destacados === 'true' && limit) {
      productos = productos.slice(0, parseInt(limit));
    }

    return Response.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}