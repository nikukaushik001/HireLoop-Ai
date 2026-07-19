import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import { ResumeService } from '../services/resume.service';
import fs from 'fs';

const resumeService = new ResumeService();

interface ParseResumeJob {
  userId: string;
  jobId: string;
  files: Array<{
    path: string;
    originalname: string;
    mimetype: string;
  }>;
}

export const resumeWorker = new Worker(
  'resume-queue',
  async (job: Job<ParseResumeJob>) => {
    const { userId, jobId, files } = job.data;
    console.log(`[ResumeWorker] Processing job ${job.id} with ${files.length} resumes for job ${jobId}`);
    
    try {
      // Pass the paths to processResumes, it will read from disk
      await resumeService.processResumes(userId, jobId, files);
      
      console.log(`[ResumeWorker] Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`[ResumeWorker] Job ${job.id} failed:`, error);
      throw error;
    } finally {
      // Clean up temporary files from disk
      for (const file of files) {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(`[ResumeWorker] Failed to delete temp file ${file.path}:`, err);
          }
        }
      }
    }
  },
  {
    connection,
    concurrency: 1, // Process 1 batch at a time to not overwhelm the AI service
  }
);

resumeWorker.on('failed', (job, err) => {
  console.error(`[ResumeWorker] Job ${job?.id} failed with error:`, err.message);
});
