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
      is_valid_resume?: boolean;
      reasoning?: string;
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

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const savedCandidates = [];
    const totalFiles = files.length;
    let processedCount = 0;

    // Import redis connection inside the function to avoid circular dependency if not at top level
    const { connection } = require('../queues/connection');

    // Initialize progress tracking
    await connection.set(`progress:${jobId}`, JSON.stringify({ processed: 0, total: totalFiles, status: 'processing' }), 'EX', 3600);

    // 2. Process each file sequentially
    for (const file of files) {
      if (!file.path.startsWith('http') && !fs.existsSync(file.path)) {
        console.warn(`File not found on disk: ${file.path}`);
        processedCount++;
        await connection.set(`progress:${jobId}`, JSON.stringify({ processed: processedCount, total: totalFiles, status: 'processing' }), 'EX', 3600);
        continue;
      }

      const formData = new FormData();
      formData.append('job_description', jobDescriptionStr);
      let fileBuffer: Buffer;
      try {
        fileBuffer = await this.storageService.downloadFile(file.path);
      } catch (err) {
        console.error(`Failed to download file from S3 or disk: ${file.path}`, err);
        processedCount++;
        await connection.set(`progress:${jobId}`, JSON.stringify({ processed: processedCount, total: totalFiles, status: 'processing' }), 'EX', 3600);
        continue;
      }
      
      formData.append('files', fileBuffer, {
        filename: file.originalname,
        contentType: file.mimetype || 'application/pdf',
      });

      let result: any = null;
      try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/process-resumes`, formData, {
          headers: { ...formData.getHeaders() }
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          result = response.data.results[0];
        } else {
          throw new Error("No results returned from AI");
        }
      } catch (err: any) {
        console.error(`Failed to process resume ${file.originalname}:`, err.message);
        const errorText = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        fs.appendFileSync('ai_error.log', new Date().toISOString() + '\nFile: ' + file.originalname + '\nStatus: ' + (err.response?.status || 500) + '\nBody: ' + errorText + '\n\n');
        
        result = {
          filename: file.originalname,
          status: 'failed',
          error: 'AI_SERVICE_ERROR: ' + (err.response?.status || 500),
          pipeline_result: { status: 'failed', error: 'API Error' }
        };
      }

      // 3. Immediately save candidate into the database
      if (result.status === 'failed' || (result.pipeline_result?.status !== 'completed' && !result.pipeline_result?.parsed_data)) {
        savedCandidates.push({
          filename: result.filename,
          status: 'failed',
          error: result.error || result.pipeline_result?.error || 'Unknown error',
        });
      } else if (result.pipeline_result.parsed_data && result.pipeline_result.parsed_data.is_valid_resume === false) {
        savedCandidates.push({
          filename: result.filename,
          status: 'failed',
          error: result.pipeline_result.parsed_data.reasoning || 'Document is not recognized as a valid resume',
        });
      } else {
        const parsed = result.pipeline_result.parsed_data;

        // Find the uploaded file to get its buffer for storage upload
        let filePath = `uploads/${result.filename}`;
        try {
          filePath = await this.storageService.uploadFile(
            fileBuffer,
            file.originalname,
            file.mimetype
          );
        } catch (err) {
          console.error(`Failed to upload ${result.filename} to storage:`, err);
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

      // Update progress in Redis
      processedCount++;
      const currentFailed = savedCandidates.filter(c => c.status === 'failed');
      const currentSuccess = savedCandidates.filter(c => c.status === 'success');
      await connection.set(`progress:${jobId}`, JSON.stringify({ 
        processed: processedCount, 
        total: totalFiles, 
        status: 'processing',
        failedCount: currentFailed.length,
        successCount: currentSuccess.length
      }), 'EX', 3600);
    }

    // Set final progress status
    const finalFailed = savedCandidates.filter(c => c.status === 'failed');
    const finalSuccess = savedCandidates.filter(c => c.status === 'success');
    await connection.set(`progress:${jobId}`, JSON.stringify({ 
      processed: totalFiles, 
      total: totalFiles, 
      status: 'completed',
      failedCount: finalFailed.length,
      successCount: finalSuccess.length,
      failedFiles: finalFailed
    }), 'EX', 3600);

    // 4. Send recruiter summary email (asynchronously)
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
