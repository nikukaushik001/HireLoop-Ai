import { Request, Response, NextFunction } from 'express';
import { ResumeService } from '../services/resume.service';
import { sendSuccess } from '../utils/api-response';
import { AppError, BadRequestError } from '../utils/api-error';

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

      const result = await resumeService.processResumes(userId, jobId, files);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
