const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrisma() {
  const userId = '1'; // Assuming a user ID
  const jobId = '1';
  
  const parsed = {
    name: 'Test Candidate',
    email: 'test@example.com',
    phone: '1234567890',
    skills: ['React'],
    experienceYears: 5,
    currentCompany: 'Test Co',
    location: 'NY'
  };

  try {
    const user = await prisma.user.findFirst();
    const candidate = await prisma.candidate.upsert({
      where: { email_userId: { email: parsed.email, userId: user.id } },
      update: {
        name: parsed.name,
        phone: parsed.phone,
        skills: parsed.skills,
        experienceYears: parsed.experienceYears,
        currentCompany: parsed.currentCompany,
        location: parsed.location,
        embedding: [0.1, 0.2]
      },
      create: {
        name: parsed.name,
        email: parsed.email,
        userId: user.id,
        phone: parsed.phone,
        skills: parsed.skills,
        experienceYears: parsed.experienceYears,
        currentCompany: parsed.currentCompany,
        location: parsed.location,
        embedding: [0.1, 0.2]
      }
    });
    console.log('Candidate created:', candidate.id);
  } catch (err) {
    console.error('Prisma Error:', err);
  }
}

testPrisma().catch(console.error);
