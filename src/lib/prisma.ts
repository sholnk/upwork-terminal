import { PrismaClient } from "@prisma/client";

// Avoid instantiating Prisma Client in every request
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  let globalForPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
