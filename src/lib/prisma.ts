import { PrismaClient } from "@prisma/client";

// Lazy-load Prisma Client to avoid connection issues during build
let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    // Only initialize if DATABASE_URL is available
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
      throw new Error(
        "DATABASE_URL is not set. Please configure your database connection."
      );
    }
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

// For compatibility, export a lazy-loading proxy
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    return Reflect.get(getPrisma(), prop);
  },
});
