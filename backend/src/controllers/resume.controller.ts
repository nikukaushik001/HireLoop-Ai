import { Request, Response, NextFunction } from 'express';
import { ResumeService } from '../services/resume.service';
import { sendSuccess } from '../utils/api-response';
import { AppError, BadRequestError } from '../utils/api-error';

// import { resumeQueue } from '../queues/resume.queue'; // BullMQ disabled temporarily

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

      // Map files to extract only the path and necessary data
      const fileData = files.map(file => ({
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
      }));

      // Process synchronously so the frontend waits for it to complete
      const result = await resumeService.processResumes(userId, jobId, fileData);

      sendSuccess(res, {
        message: 'Resumes processed successfully!',
        data: result
      }, 200);
    } catch (error: any) {
      require('fs').appendFileSync('resume_error.log', new Date().toISOString() + '\\n' + (error.stack || error.message || String(error)) + '\\n\\n');
      next(error);
    }
  }
}
