import { prisma } from "@/lib/prisma";

/**
 * Normaliza el campo imagenes de PostgreSQL a array JavaScript
 */
function normalizarImagenes(producto) {
  let imagenes = [];
  
  if (Array.isArray(producto.imagenes)) {
    imagenes = producto.imagenes;
  } else if (typeof producto.imagenes === 'string' && producto.imagenes.length > 0) {
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

  const imagenesValidas = imagenes.filter(
    url => url && typeof url === 'string' && url.startsWith('http')
  );

  if (imagenesValidas.length === 0 && producto.imagen?.startsWith('http')) {
    imagenesValidas.push(producto.imagen);
  }

  return {
    ...producto,
    imagenes: imagenesValidas
  };
}

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

    // ✅ Normalizar imagenes
    const productoNormalizado = normalizarImagenes(producto);

    return Response.json(productoNormalizado);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}