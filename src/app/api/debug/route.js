import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ruta temporal de debug - visitar /api/debug-imagenes en producción
// BORRAR después de confirmar el problema
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      take: 3,
      select: {
        id: true,
        nombre: true,
        imagen: true,
        imagenes: true,
      },
    });

    const debug = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      imagen: p.imagen,
      imagenes_raw: p.imagenes,
      imagenes_type: typeof p.imagenes,
      imagenes_isArray: Array.isArray(p.imagenes),
      imagenes_length: Array.isArray(p.imagenes) ? p.imagenes.length : 'N/A',
    }));

    return Response.json({ debug }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}