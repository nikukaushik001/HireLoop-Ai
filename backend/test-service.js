const { ResumeService } = require('./dist/services/resume.service');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function test() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst();
  const job = await prisma.job.findFirst();

  if (!user || !job) {
    console.log("No user or job found");
    return;
  }

  // Create a dummy PDF file for testing
  fs.writeFileSync('test.pdf', '%PDF-1.4\nTest');

  const files = [{
    path: 'test.pdf',
    originalname: 'test.pdf',
    mimetype: 'application/pdf'
  }];

  const resumeService = new ResumeService();
  try {
    const res = await resumeService.processResumes(user.id, job.id, files);
    console.log('Success:', res);
  } catch (err) {
    console.error('Error in processResumes:', err);
  }
}

test().catch(console.error);
