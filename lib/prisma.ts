import { PrismaClient } from "@prisma/client";

// Undgår at oprette flere PrismaClient-instanser under hot-reload i udvikling
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
