const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'admin@hireloop.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Promoted admin@hireloop.com to ADMIN');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
