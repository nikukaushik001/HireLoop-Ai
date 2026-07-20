import fs from 'fs';
import { prisma } from '../config/db';
import { AppError, NotFoundError } from '../utils/api-error';
import { StorageService } from './storage.service';
import { EmailService } from './email.service';

interface AIProcessedCandidate {
  filename: string;
  pipeline_result: {
    raw_text: string;
    parsed_data: {
      name: string;
      email: string;
      phone: string;
      skills: string[];
      experienceYears: number;
      currentCompany: string;
      location: string;
      achievements?: string[];
      culture_fit_summary?: string;
    };
    embedding: number[];
    evaluation?: {
      score: number;
      reasoning: string;
    };
    status: string;
    error: string | null;
  };
}

import FormData from 'form-data';
import axios from 'axios';

// ... (existing interface)

export class ResumeService {
  private storageService = new StorageService();
  private emailService = new EmailService();

  /**
   * Sends PDF files to the FastAPI AI service for processing,
   * then saves the structured candidate data into the database.
   */
  async processResumes(userId: string, jobId: string, files: Array<{ path: string; originalname: string; mimetype: string }>) {
    // 1. Verify the job exists and include recruiter info
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { user: true }
    });
    if (!job) throw new NotFoundError('Job');

    // Prepare job description for the AI Agent
    const jobDescriptionStr = `Title: ${job.title}\nDepartment: ${job.department || 'N/A'}\nDescription: ${job.description || ''}\nRequirements: ${job.requirements || ''}`;

    // 2. Build multipart form data to send to FastAPI
    const formData = new FormData();
    formData.append('job_description', jobDescriptionStr);
    for (const file of files) {
      if (!fs.existsSync(file.path)) {
        console.warn(`File not found on disk: ${file.path}`);
        continue;
      }
      const fileBuffer = fs.readFileSync(file.path);
      formData.append('files', fileBuffer, {
        filename: file.originalname,
        contentType: file.mimetype || 'application/pdf',
      });
    }

    // 3. Call FastAPI AI service
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    let aiResult;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/process-resumes`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      aiResult = response.data;
    } catch (err: any) {
      const errorText = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      fs.appendFileSync('ai_error.log', new Date().toISOString() + '\nStatus: ' + (err.response?.status || 500) + '\nBody: ' + errorText + '\n\n');
      throw new AppError('Failed to process resumes through AI pipeline', 502, 'AI_SERVICE_ERROR');
    }

    // 4. Save each processed candidate into the database
    const savedCandidates = [];
    for (const result of aiResult.results) {
      if (result.pipeline_result?.status !== 'completed' && !result.pipeline_result?.parsed_data) {
        savedCandidates.push({
          filename: result.filename,
          status: 'failed',
          error: result.pipeline_result?.error || 'Unknown error',
        });
        continue;
      }

      const parsed = result.pipeline_result.parsed_data;

      // Find the uploaded file to get its buffer for storage upload
      const uploadedFile = files.find(f => f.originalname === result.filename);
      let filePath = `uploads/${result.filename}`;
      if (uploadedFile && fs.existsSync(uploadedFile.path)) {
        try {
          const fileBuffer = fs.readFileSync(uploadedFile.path);
          filePath = await this.storageService.uploadFile(
            fileBuffer,
            uploadedFile.originalname,
            uploadedFile.mimetype
          );
        } catch (err) {
          console.error(`Failed to upload ${result.filename} to storage:`, err);
        }
      }

      // Create or update the candidate in the talent pool
      const candidate = await prisma.candidate.upsert({
        where: { email_userId: { email: parsed.email, userId: userId } },
        update: {
          name: parsed.name,
          phone: parsed.phone,
          skills: parsed.skills,
          experienceYears: parsed.experienceYears,
          currentCompany: parsed.currentCompany,
          location: parsed.location,
          cultureFitSummary: parsed.culture_fit_summary,
          embedding: result.pipeline_result.embedding,
        },
        create: {
          name: parsed.name,
          email: parsed.email,
          userId: userId,
          phone: parsed.phone,
          skills: parsed.skills,
          experienceYears: parsed.experienceYears,
          currentCompany: parsed.currentCompany,
          location: parsed.location,
          cultureFitSummary: parsed.culture_fit_summary,
          embedding: result.pipeline_result.embedding,
        },
      });

      // Get version count
      const existingResumesCount = await prisma.resume.count({
        where: { candidateId: candidate.id }
      });
      const newVersion = existingResumesCount + 1;

      // Create the resume record
      const resume = await prisma.resume.create({
        data: {
          fileName: result.filename,
          filePath: filePath,
          candidateId: candidate.id,
          rawText: result.pipeline_result.raw_text,
          parsedData: parsed as any,
          parseStatus: 'COMPLETED',
          version: newVersion,
          embedding: result.pipeline_result.embedding,
        },
      });

      // Get the AI score from the evaluation node
      const aiScore = result.pipeline_result.evaluation?.score || 0;
      const aiReasoning = result.pipeline_result.evaluation?.reasoning || '';

      // Create a job application linking candidate to job and specific resume version
      await prisma.application.upsert({
        where: {
          candidateId_jobId: { jobId, candidateId: candidate.id },
        },
        update: {
          status: 'NEW',
          aiScore: aiScore,
          aiReasoning: aiReasoning,
          resumeId: resume.id
        },
        create: {
          jobId,
          candidateId: candidate.id,
          resumeId: resume.id,
          aiScore: aiScore,
          aiReasoning: aiReasoning,
          status: 'NEW',
          source: 'AI_RECOMMENDED',
        },
      });

      savedCandidates.push({
        filename: result.filename,
        status: 'success',
        candidateId: candidate.id,
        candidateName: candidate.name,
      });
    }

    // 5. Send recruiter summary email (asynchronously)
    const successList = savedCandidates
      .filter(c => c.status === 'success')
      .map(c => `${c.candidateName} (${c.filename})`);
    const successCount = successList.length;
    const failedCount = savedCandidates.filter(c => c.status === 'failed').length;

    if (job.user && job.user.email) {
      this.emailService.sendRecruiterUploadSummary(
        job.user.email,
        job.title,
        successCount,
        failedCount,
        successList
      ).catch(err => console.error('Failed to send recruiter resume processing summary email:', err));
    }

    return {
      jobId,
      totalFiles: files.length,
      processed: savedCandidates,
    };
  }
}
