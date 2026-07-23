import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development due to hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Force a higher connection limit dynamically for Vercel/Production
let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && !databaseUrl.includes('connection_limit')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}connection_limit=100`;
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {})
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
