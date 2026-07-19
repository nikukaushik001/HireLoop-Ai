import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { sendSuccess } from '../utils/api-response';

const applicationService = new ApplicationService();

export class ApplicationController {
  async getAllInterviews(req: Request, res: Response, next: NextFunction) {
    try {
      const hrId = req.user?.id;
      if (!hrId) throw new Error('Unauthorized');
      const result = await applicationService.getAllInterviews(hrId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.jobId as string;
      const appId = req.params.appId as string;
      const { status } = req.body;
      const result = await applicationService.updateApplicationStatus(jobId, appId, status);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.jobId as string;
      const appId = req.params.appId as string;
      // req.body should contain scheduledAt, durationMinutes, interviewerName, meetingLink
      // Need to parse scheduledAt to Date
      const data = {
        ...req.body,
        scheduledAt: new Date(req.body.scheduledAt)
      };
      const result = await applicationService.scheduleInterview(jobId, appId, data);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async submitInterviewFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string; // interviewId
      const result = await applicationService.submitInterviewFeedback(id, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const hrId = req.user?.id;
      if (!hrId) throw new Error('Unauthorized');
      const result = await applicationService.getDashboardStats(hrId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string; // candidateId
      const result = await applicationService.getRecommendedJobs(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async notifyShortlisted(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.jobId as string;
      const { candidateIds } = req.body;
      const result = await applicationService.notifyShortlistedCandidates(jobId, candidateIds);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
