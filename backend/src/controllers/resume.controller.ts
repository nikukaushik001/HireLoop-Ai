import { Request, Response, NextFunction } from 'express';
import { ResumeService } from '../services/resume.service';
import { sendSuccess } from '../utils/api-response';
import { AppError, BadRequestError } from '../utils/api-error';

import { resumeQueue } from '../queues/resume.queue';

const resumeService = new ResumeService();

export class ResumeController {
  async uploadResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const jobId = req.body.jobId as string;

      if (!jobId) {
        throw new BadRequestError('jobId is required');
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new BadRequestError('At least one PDF file is required');
      }

      // Map files to extract only the path/location and necessary data
      const fileData = files.map((file: any) => ({
        path: file.location || file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
      }));

      // ADD TO QUEUE
      await resumeQueue.add('parse-resume', {
        userId,
        jobId,
        files: fileData
      });

      sendSuccess(res, {
        message: 'Resumes added to queue for processing. You will receive an email once complete.',
        data: { queued: true, count: fileData.length, jobId }
      }, 200);
    } catch (error: any) {
      require('fs').appendFileSync('resume_error.log', new Date().toISOString() + '\\n' + (error.stack || error.message || String(error)) + '\\n\\n');
      next(error);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { connection } = require('../queues/connection');
      const progressData = await connection.get(`progress:${jobId}`);
      
      if (!progressData) {
        return sendSuccess(res, { processed: 0, total: 0, status: 'unknown' }, 200);
      }
      
      const progress = JSON.parse(progressData);
      sendSuccess(res, progress, 200);
    } catch (error) {
      next(error);
    }
  }
}
