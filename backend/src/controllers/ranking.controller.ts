import { Request, Response, NextFunction } from 'express';
import { RankingService } from '../services/ranking.service';
import { sendSuccess } from '../utils/api-response';
import { BadRequestError } from '../utils/api-error';

const rankingService = new RankingService();

export class RankingController {
  async rankCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.id;
      if (!jobId) {
        throw new BadRequestError('jobId is required');
      }

      const result = await rankingService.rankCandidatesForJob(jobId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
