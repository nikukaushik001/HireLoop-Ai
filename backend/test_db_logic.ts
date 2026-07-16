import { PrismaClient } from '@prisma/client';
import { ResumeService } from './src/services/resume.service';
import fs from 'fs';

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst();
    const job = await prisma.job.findFirst();
    if (!user || !job) {
      console.log('No user or job found');
      return;
    }

    const dummyPdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n198\n%%EOF');
    
    // Simulate Express.Multer.File
    const files = [{
      fieldname: 'files',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: dummyPdfBytes,
      size: dummyPdfBytes.length
    }] as any;

    const resumeService = new ResumeService();
    console.log('Calling processResumes...');
    const result = await resumeService.processResumes(user.id, job.id, files);
    console.log('Success:', result);
  } catch (error) {
    console.error('🔥 Service Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
