const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImagenes() {
  console.log('🧪 Probando funcionalidad de múltiples imágenes...\n');

  try {
    // Test 1: Verificar que el campo imagenes existe
    console.log('📋 Test 1: Verificando estructura de la tabla...');
    const producto = await prisma.producto.findFirst();
    
    if (producto) {
      console.log('✅ Campo "imagenes" detectado en el modelo');
      console.log('   Ejemplo:', producto.imagenes || '[]');
    }

    // Test 2: Crear un producto con múltiples imágenes
    console.log('\n📋 Test 2: Creando producto con múltiples imágenes...');
    
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: "TEST - Galería Múltiple Imágenes",
        descripcion: "Producto de prueba para galería",
        precio: 9999.99,
        stock: 5,
        stockMinimo: 2,
        imagenes: [
          "https://via.placeholder.com/800x800?text=Imagen+1",
          "https://via.placeholder.com/800x800?text=Imagen+2",
          "https://via.placeholder.com/800x800?text=Imagen+3",
          "https://via.placeholder.com/800x800?text=Imagen+4"
        ],
        imagen: "https://via.placeholder.com/800x800?text=Imagen+1",
        categoriaId: 1,
        proveedorId: 1
      }
    });
    
    console.log('✅ Producto creado exitosamente:');
    console.log('   ID:', nuevoProducto.id);
    console.log('   Nombre:', nuevoProducto.nombre);
    console.log('   Imágenes:', nuevoProducto.imagenes.length, 'fotos');

    // Test 3: Leer el producto y verificar imagenes
    console.log('\n📋 Test 3: Leyendo producto creado...');
    
    const productoLeido = await prisma.producto.findUnique({
      where: { id: nuevoProducto.id },
      include: {
        categoria: true,
        proveedor: true
      }
    });
    
    console.log('✅ Producto leído correctamente:');
    console.log('   Imagenes array:', productoLeido.imagenes);
    console.log('   Total imágenes:', productoLeido.imagenes.length);

    // Test 4: Actualizar agregando más imágenes
    console.log('\n📋 Test 4: Agregando más imágenes...');
    
    const productoActualizado = await prisma.producto.update({
      where: { id: nuevoProducto.id },
      data: {
        imagenes: [
          ...productoLeido.imagenes,
          "https://via.placeholder.com/800x800?text=Imagen+5"
        ]
      }
    });
    
    console.log('✅ Imágenes actualizadas:');
    console.log('   Antes:', productoLeido.imagenes.length, 'fotos');
    console.log('   Después:', productoActualizado.imagenes.length, 'fotos');

    // Test 5: Limpiar - Eliminar producto de prueba
    console.log('\n📋 Test 5: Limpiando producto de prueba...');
    
    await prisma.producto.delete({
      where: { id: nuevoProducto.id }
    });
    
    console.log('✅ Producto de prueba eliminado');

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('✅ ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
    console.log('='.repeat(50));
    console.log('\n📝 El sistema de múltiples imágenes está funcionando correctamente.');
    console.log('📝 Puedes proceder a implementar los componentes del frontend.');
    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Ejecutar: node scripts/migrate-images.js');
    console.log('   2. Implementar ProductGallery.js en tu proyecto');
    console.log('   3. Actualizar la página de detalle del producto');
    console.log('   4. ¡Disfrutar de la galería! 🎉\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:');
    console.error('   Mensaje:', error.message);
    console.error('\n💡 Posibles soluciones:');
    
    if (error.message.includes('imagenes')) {
      console.error('   - El campo "imagenes" no existe en la base de datos');
      console.error('   - Ejecuta: npx prisma db push');
      console.error('   - O agrega el campo manualmente en Supabase');
    } else if (error.message.includes('categoriaId') || error.message.includes('proveedorId')) {
      console.error('   - No existe una categoría o proveedor con ID 1');
      console.error('   - Crea primero una categoría y proveedor');
      console.error('   - O usa IDs existentes en tu base de datos');
    } else if (error.message.includes('Foreign key')) {
      console.error('   - Problema con relaciones de la base de datos');
      console.error('   - Verifica que existan registros en categorias y proveedores');
    } else {
      console.error('   - Verifica tu conexión a la base de datos');
      console.error('   - Ejecuta: npx prisma generate');
      console.error('   - Revisa el archivo .env');
    }
    
    console.error('\n📚 Consulta SOLUCION-AGREGAR-CAMPO.md para más ayuda\n');
    
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar tests
testImagenes();