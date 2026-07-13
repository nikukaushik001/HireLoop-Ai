import { Request, Response, NextFunction } from 'express';
import { CandidateService } from '../services/candidate.service';
import { sendSuccess } from '../utils/api-response';

const candidateService = new CandidateService();

export class CandidateController {
  async getAllCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await candidateService.getAllCandidates();
      sendSuccess(res, candidates, 200);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req: Request, res: Response, next: NextFunction) {
    try {
      const candidate = await candidateService.getCandidateById(req.params.id as string);
      sendSuccess(res, candidate, 200);
    } catch (error) {
      next(error);
    }
  }
}
