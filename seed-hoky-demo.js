// ══════════════════════════════════════════════════════════════
// scripts/seed-hoky-demo.js
// Seed de demo con imágenes reales de Unsplash (streetwear/ropa urbana)
// Todas las URLs son públicas, permanentes y gratuitas (Unsplash License)
//
// USO:
//   node scripts/seed-hoky-demo.js
// ══════════════════════════════════════════════════════════════

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const TENANT_ID = process.env.DEVHUB_TENANT_ID;

function cuid() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `c${ts}${rand}`;
}

// ── Imágenes de Unsplash por categoría ────────────────────────
// URLs estables del CDN de Unsplash — no expiran
const IMG = {
  remeras: [
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
  ],
  pantalones: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
    'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80',
  ],
  hoodies: [
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80',
    'https://images.unsplash.com/photo-1572495532056-8583af1cbae0?w=800&q=80',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
    'https://images.unsplash.com/photo-1614495196041-a9b5c1cce3a3?w=800&q=80',
    'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80',
    'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&q=80',
    'https://images.unsplash.com/photo-1647923317627-b2b7d1fe5e95?w=800&q=80',
  ],
  camperas: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    'https://images.unsplash.com/photo-1600950207944-0d63e8edbc3f?w=800&q=80',
    'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800&q=80',
  ],
};

// ── Datos de los 20 productos ──────────────────────────────────
const SEED_DATA = {
  categorias: [
    { nombre: 'Remeras',            descripcion: 'Remeras urbanas y streetwear' },
    { nombre: 'Pantalones',         descripcion: 'Baggys, joggers y pantalones de calle' },
    { nombre: 'Hoodies & Sweaters', descripcion: 'Hoodies oversize y sweaters de temporada' },
    { nombre: 'Camperas',           descripcion: 'Camperas de abrigo y estilo urbano' },
  ],

  productos: {
    'Remeras': [
      { nombre: 'Remera Básica Negro',     precio: 18500, stock: 25, i: 0, desc: 'Remera de algodón 100%. Corte regular. Talle S al XL.' },
      { nombre: 'Remera Oversize Gris',    precio: 21000, stock: 18, i: 1, desc: 'Remera oversize con caída natural. Estilo urbano.' },
      { nombre: 'Remera Estampada Hoky',   precio: 24500, stock: 15, i: 2, desc: 'Remera con estampa exclusiva Hoky en pecho.' },
      { nombre: 'Remera Manga Larga',      precio: 22000, stock: 20, i: 3, desc: 'Remera manga larga para clima frío. Algodón interlock.' },
      { nombre: 'Remera Cropped',          precio: 19500, stock: 12, i: 4, desc: 'Remera cropped con corte moderno. Ideal para layering.' },
    ],
    'Pantalones': [
      { nombre: 'Baggy Clásico Negro',     precio: 55000, stock: 20, i: 0, desc: 'Baggy de jean con corte ancho. Talle 38 al 46.' },
      { nombre: 'Baggy Gris Urbano',       precio: 52000, stock: 15, i: 1, desc: 'Baggy de tela liviana. Perfecto para el día a día.' },
      { nombre: 'Jogging Oversize',        precio: 42000, stock: 22, i: 2, desc: 'Jogging con elástico en tobillo. Friza interior.' },
      { nombre: 'Pantalón Cargo',          precio: 58000, stock: 10, i: 3, desc: 'Pantalón cargo con bolsillos laterales. Tela resistente.' },
      { nombre: 'Baggy Ripstop',           precio: 60000, stock: 8,  i: 4, desc: 'Baggy en tela ripstop. Edición limitada.' },
    ],
    'Hoodies & Sweaters': [
      { nombre: 'Hoodie Oversize Negro',   precio: 68000, stock: 18, i: 0, desc: 'Hoodie con capucha doble capa. Canguro frontal.' },
      { nombre: 'Sweater Knit Gris',       precio: 62000, stock: 14, i: 1, desc: 'Sweater tejido punto inglés. Abriga sin perder estilo.' },
      { nombre: 'Hoodie Cropped',          precio: 65000, stock: 10, i: 2, desc: 'Hoodie cropped para look urbano.' },
      { nombre: 'Buzo Canguro Hoky',       precio: 59000, stock: 20, i: 3, desc: 'Buzo canguro con logo bordado en pecho.' },
      { nombre: 'Sweater Oversize Marrón', precio: 63000, stock: 12, i: 4, desc: 'Sweater oversize en tono tierra. Tendencia temporada.' },
    ],
    'Camperas': [
      { nombre: 'Campera Rompevientos',    precio: 85000,  stock: 12, i: 0, desc: 'Rompevientos impermeable liviano. Para el día a día.' },
      { nombre: 'Campera Acolchada',       precio: 95000,  stock: 8,  i: 1, desc: 'Campera con relleno de pluma sintética. Muy abrigada.' },
      { nombre: 'Campera de Jean',         precio: 78000,  stock: 15, i: 2, desc: 'Campera de jean oversize. Clásico streetwear.' },
      { nombre: 'Bomber Urbana',           precio: 88000,  stock: 10, i: 3, desc: 'Bomber con ribetes en contraste. Estilo deportivo.' },
      { nombre: 'Campera Técnica',         precio: 102000, stock: 6,  i: 4, desc: 'Campera técnica multipocket. Funcional y con estilo.' },
    ],
  },
};

const IMG_KEY = {
  'Remeras':            'remeras',
  'Pantalones':         'pantalones',
  'Hoodies & Sweaters': 'hoodies',
  'Camperas':           'camperas',
};

// ── MAIN ───────────────────────────────────────────────────────
async function main() {
  if (!TENANT_ID) {
    console.error('\n❌  DEVHUB_TENANT_ID no está definido en .env');
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║       HOKY DEMO SEED — Imágenes Unsplash         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n🏷️  Tenant: ${TENANT_ID}\n`);

  // 1. Limpiar
  console.log('🗑️  Limpiando datos anteriores del tenant...');
  await prisma.ventaItem.deleteMany({ where: { producto: { tenantId: TENANT_ID } } });
  await prisma.movimiento.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.precioHistorico.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.producto.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.categoria.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.proveedor.deleteMany({ where: { tenantId: TENANT_ID } });
  console.log('   ✅ Limpio\n');

  // 2. Proveedor
  const proveedorId = cuid();
  await prisma.proveedor.create({
    data: { id: proveedorId, tenantId: TENANT_ID, nombre: 'Hoky Brand' },
  });

  // 3. Categorías
  console.log('📂  Creando categorías...');
  const catMap = {};
  for (const cat of SEED_DATA.categorias) {
    const id = cuid();
    await prisma.categoria.create({
      data: { id, tenantId: TENANT_ID, nombre: cat.nombre, descripcion: cat.descripcion },
    });
    catMap[cat.nombre] = id;
    console.log(`   ✅ ${cat.nombre}`);
  }

  // 4. Productos
  console.log('\n👕  Creando productos...');
  let total = 0;

  for (const [catNombre, prods] of Object.entries(SEED_DATA.productos)) {
    const categoriaId = catMap[catNombre];
    const imgs = IMG[IMG_KEY[catNombre]];
    console.log(`\n   📁 ${catNombre}`);

    for (const prod of prods) {
      const id = cuid();

      const imagen = imgs[prod.i];
      const imagenes = [
        imgs[prod.i % imgs.length],
        imgs[(prod.i + 5) % imgs.length],
        imgs[(prod.i + 6) % imgs.length],
      ];

      await prisma.producto.create({
        data: {
          id,
          tenantId:       TENANT_ID,
          nombre:         prod.nombre,
          descripcion:    prod.desc,
          precio:         prod.precio,
          stock:          prod.stock,
          stockMinimo:    3,
          activo:         true,
          imagen,
          imagenes,
          categoriaId,
          proveedorId,
          codigoProducto: `HKY-${id.slice(-6).toUpperCase()}`,
        },
      });

      console.log(`      ✅ ${prod.nombre} — $${prod.precio.toLocaleString('es-AR')}`);
      total++;
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  // Resumen
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                ✅  SEED COMPLETO                 ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  📂 Categorías : ${SEED_DATA.categorias.length}                              ║`);
  console.log(`║  👕 Productos  : ${total}                             ║`);
  console.log(`║  🖼️  Imágenes   : ${total * 3} (3 por producto)             ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('\n🚀  Abrí http://localhost:3000 para ver la demo\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());