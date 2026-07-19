import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import { EmailService } from '../services/email.service';
import nodemailer from 'nodemailer';

const emailService = new EmailService();

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job<{ to: string; subject: string; text: string; html: string }>) => {
    console.log(`[EmailWorker] Processing job ${job.id} for ${job.data.to}`);
    
    try {
      // Re-use the existing sendMail logic to get the transporter and send
      await emailService.sendMail(job.data);
      console.log(`[EmailWorker] Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`[EmailWorker] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 emails concurrently
  }
);

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed with error:`, err.message);
});
