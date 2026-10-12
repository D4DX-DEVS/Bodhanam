import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    // PRISMA_LOG_QUERIES=1 prints every query — handy to audit what a page fetches.
    log: process.env.PRISMA_LOG_QUERIES ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
