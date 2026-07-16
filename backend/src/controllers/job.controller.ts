import { Request, Response, NextFunction } from 'express';
import { JobService, CreateJobDTO } from '../services/job.service';
import { sendSuccess } from '../utils/api-response';

const jobService = new JobService();

export class JobController {
  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateJobDTO;
      const userId = req.user.id; // From auth middleware
      const job = await jobService.createJob(userId, data);
      sendSuccess(res, job, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const jobs = await jobService.getAllJobs(userId, role);
      sendSuccess(res, jobs, 200);
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJobById(req.params.id as string);
      sendSuccess(res, job, 200);
    } catch (error) {
      next(error);
    }
  }

  async closeJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.closeJob(req.params.id as string);
      sendSuccess(res, job, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as Partial<CreateJobDTO>;
      const job = await jobService.updateJob(req.params.id as string, data);
      sendSuccess(res, job, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      await jobService.deleteJob(req.params.id as string);
      sendSuccess(res, { message: 'Job deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
