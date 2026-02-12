import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normaliza el campo imagenes de PostgreSQL a array JavaScript
 */
function normalizarImagenes(producto) {
  let imagenes = [];
  
  if (Array.isArray(producto.imagenes)) {
    imagenes = producto.imagenes;
  } else if (typeof producto.imagenes === 'string' && producto.imagenes.length > 0) {
    // Caso PostgreSQL: "{url1,url2}" o '["url1","url2"]'
    if (producto.imagenes.startsWith('{')) {
      imagenes = producto.imagenes
        .replace(/^\{/, '')
        .replace(/\}$/, '')
        .split(',')
        .map(s => s.replace(/^"/, '').replace(/"$/, '').trim())
        .filter(Boolean);
    } else if (producto.imagenes.startsWith('[')) {
      try {
        imagenes = JSON.parse(producto.imagenes);
      } catch (e) {
        console.error('Error parsing imagenes JSON:', e);
      }
    } else if (producto.imagenes.startsWith('http')) {
      imagenes = [producto.imagenes];
    }
  }

  // Filtrar solo URLs válidas
  const imagenesValidas = imagenes.filter(
    url => url && typeof url === 'string' && url.startsWith('http')
  );

  // Fallback a imagen principal si no hay imagenes
  if (imagenesValidas.length === 0 && producto.imagen?.startsWith('http')) {
    imagenesValidas.push(producto.imagen);
  }

  return {
    ...producto,
    imagenes: imagenesValidas
  };
}

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

    // ✅ Normalizar imagenes para cada producto
    productos = productos.map(normalizarImagenes);

    if (destacados === 'true' && limit) {
      productos = productos.slice(0, parseInt(limit));
    }

    return Response.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}