const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { resumes: true }
  });
  console.log(JSON.stringify(candidates, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
