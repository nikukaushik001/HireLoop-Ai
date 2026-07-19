const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Candidate" CASCADE');
  console.log('Cleared Candidate table');
}
main().catch(console.error);
