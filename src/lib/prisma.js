// src/lib/prisma.js
// Hoky usa la misma BD que DevHub POS.
// Todas las queries de productos DEBEN incluir tenantId: TENANT_ID.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Tenant ID del negocio Hoky — se inyecta en cada query de producto
export const TENANT_ID = process.env.DEVHUB_TENANT_ID;