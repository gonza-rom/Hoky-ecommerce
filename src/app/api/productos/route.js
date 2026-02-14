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
      try { imagenes = JSON.parse(producto.imagenes); } catch {}
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

  return { ...producto, imagenes: imagenesValidas };
}

/**
 * Convierte string vacío a null (evita errores de unique constraint)
 */
function toNullIfEmpty(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // ── Parámetros de paginación ──
    const page     = Math.max(1, parseInt(searchParams.get('page')     || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')));
    const skip     = (page - 1) * pageSize;

    // ── Parámetros de filtrado ──
    const busqueda  = searchParams.get('busqueda')?.trim()  || '';
    const categoria = searchParams.get('categoria')?.trim() || '';
    const ordenar   = searchParams.get('ordenar')           || '';

    // ── Modo especial: destacados para el home (sin paginación) ──
    const destacados = searchParams.get('destacados') === 'true';
    const limit      = parseInt(searchParams.get('limit') || '8');

    // ── Construcción del WHERE ──
    const where = { stock: { gt: 0 } };

    if (categoria) {
      where.categoriaId = parseInt(categoria);
    }

    if (busqueda) {
      where.OR = [
        { nombre:         { contains: busqueda, mode: 'insensitive' } },
        { descripcion:    { contains: busqueda, mode: 'insensitive' } },
        { codigoProducto: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    // ── Construcción del ORDER BY ──
    let orderBy = { createdAt: 'desc' };
    if (ordenar === 'precio-asc')  orderBy = { precio: 'asc'  };
    if (ordenar === 'precio-desc') orderBy = { precio: 'desc' };
    if (ordenar === 'nombre')      orderBy = { nombre: 'asc'  };
    if (ordenar === 'recientes')   orderBy = { createdAt: 'desc' };

    // ── Modo destacados: solo para el home, sin paginación ──
    if (destacados) {
      const productos = await prisma.producto.findMany({
        where,
        include: { categoria: true, proveedor: true },
        orderBy,
        take: limit,
      });
      return Response.json(productos.map(normalizarImagenes));
    }

    // ── Consulta paginada con conteo en paralelo (1 round-trip) ──
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: { categoria: true, proveedor: true },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.producto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return Response.json({
      productos: productos.map(normalizarImagenes),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombre, descripcion, precio, stock, stockMinimo,
      imagen, imagenes, categoriaId, proveedorId,
    } = body;

    const codigoProducto = toNullIfEmpty(body.codigoProducto);
    const codigoBarras   = toNullIfEmpty(body.codigoBarras);

    // Verificar unicidad antes de insertar
    if (codigoProducto) {
      const existente = await prisma.producto.findUnique({ where: { codigoProducto } });
      if (existente) {
        return Response.json(
          { error: `Ya existe un producto con el código "${codigoProducto}": ${existente.nombre}` },
          { status: 400 }
        );
      }
    }
    if (codigoBarras) {
      const existente = await prisma.producto.findUnique({ where: { codigoBarras } });
      if (existente) {
        return Response.json(
          { error: `Ya existe un producto con ese código de barras: ${existente.nombre}` },
          { status: 400 }
        );
      }
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        codigoProducto,
        codigoBarras,
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        stockMinimo: parseInt(stockMinimo) || 5,
        imagen: imagen || null,
        imagenes: imagenes || [],
        categoriaId: parseInt(categoriaId),
        proveedorId: parseInt(proveedorId),
      },
      include: { categoria: true, proveedor: true },
    });

    return Response.json(normalizarImagenes(producto), { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.code === 'P2002') {
      const campo = error.meta?.target?.includes('codigoBarras') ? 'código de barras' : 'código de producto';
      return Response.json({ error: `Ya existe un producto con ese ${campo}` }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}