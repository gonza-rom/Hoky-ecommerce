/*
  Warnings:

  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Producto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `proveedorId` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the `Movimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrecioHistorico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proveedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Venta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VentaItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'REEMBOLSADO');

-- DropForeignKey
ALTER TABLE "Movimiento" DROP CONSTRAINT "Movimiento_productoId_fkey";

-- DropForeignKey
ALTER TABLE "PrecioHistorico" DROP CONSTRAINT "PrecioHistorico_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "VentaItem" DROP CONSTRAINT "VentaItem_productoId_fkey";

-- DropForeignKey
ALTER TABLE "VentaItem" DROP CONSTRAINT "VentaItem_ventaId_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imagen" TEXT,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Categoria_id_seq";

-- AlterTable
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_pkey",
DROP COLUMN "proveedorId",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "costo" DOUBLE PRECISION,
ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "precioAnterior" DOUBLE PRECISION,
ADD COLUMN     "tieneVariantes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unidad" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "stockMinimo" SET DEFAULT 1,
ALTER COLUMN "imagenes" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "categoriaId" DROP NOT NULL,
ALTER COLUMN "categoriaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Producto_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Producto_id_seq";

-- DropTable
DROP TABLE "Movimiento";

-- DropTable
DROP TABLE "PrecioHistorico";

-- DropTable
DROP TABLE "Proveedor";

-- DropTable
DROP TABLE "Venta";

-- DropTable
DROP TABLE "VentaItem";

-- CreateTable
CREATE TABLE "ProductoVariante" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "talle" TEXT,
    "color" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "precio" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductoVariante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "dni" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direccion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "alias" TEXT,
    "calle" TEXT NOT NULL,
    "numero" TEXT,
    "piso" TEXT,
    "departamento" TEXT,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Direccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "direccionId" TEXT,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costoEnvio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "metodoPago" TEXT,
    "mpPaymentId" TEXT,
    "mpStatus" TEXT,
    "pagadoAt" TIMESTAMP(3),
    "tipoEnvio" TEXT,
    "tracking" TEXT,
    "enviadoAt" TIMESTAMP(3),
    "entregadoAt" TIMESTAMP(3),
    "compradorNombre" TEXT,
    "compradorEmail" TEXT,
    "compradorTelefono" TEXT,
    "notas" TEXT,
    "notasInternas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT,
    "varianteId" TEXT,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "talle" TEXT,
    "color" TEXT,
    "imagen" TEXT,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigTienda" (
    "id" TEXT NOT NULL,
    "mpPublicKey" TEXT,
    "mpAccessToken" TEXT,
    "mpWebhookSecret" TEXT,
    "costoEnvioBase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "envioGratisDesde" DOUBLE PRECISION,
    "zonaEnvio" TEXT,
    "montoMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "permitirRetiro" BOOLEAN NOT NULL DEFAULT true,
    "direccionLocal" TEXT,
    "horarioLocal" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "email" TEXT,
    "bannerTexto" TEXT,
    "politicaEnvio" TEXT,
    "politicaCambios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigTienda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductoVariante_productoId_idx" ON "ProductoVariante"("productoId");

-- CreateIndex
CREATE INDEX "ProductoVariante_productoId_activo_idx" ON "ProductoVariante"("productoId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoVariante_productoId_talle_color_key" ON "ProductoVariante"("productoId", "talle", "color");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_supabaseId_key" ON "Cliente"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "Cliente_email_idx" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "Cliente_supabaseId_idx" ON "Cliente"("supabaseId");

-- CreateIndex
CREATE INDEX "Direccion_clienteId_idx" ON "Direccion"("clienteId");

-- CreateIndex
CREATE INDEX "Direccion_clienteId_esPrincipal_idx" ON "Direccion"("clienteId", "esPrincipal");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_clienteId_idx" ON "Pedido"("clienteId");

-- CreateIndex
CREATE INDEX "Pedido_mpPaymentId_idx" ON "Pedido"("mpPaymentId");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE INDEX "Pedido_estado_createdAt_idx" ON "Pedido"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoItem_productoId_idx" ON "PedidoItem"("productoId");

-- CreateIndex
CREATE INDEX "Categoria_activo_idx" ON "Categoria"("activo");

-- CreateIndex
CREATE INDEX "Categoria_orden_idx" ON "Categoria"("orden");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "Producto_destacado_idx" ON "Producto"("destacado");

-- CreateIndex
CREATE INDEX "Producto_activo_categoriaId_idx" ON "Producto"("activo", "categoriaId");

-- CreateIndex
CREATE INDEX "Producto_activo_destacado_idx" ON "Producto"("activo", "destacado");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoVariante" ADD CONSTRAINT "ProductoVariante_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "Direccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductoVariante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
