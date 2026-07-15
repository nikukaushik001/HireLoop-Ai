import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { ApplicationController } from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const candidateController = new CandidateController();
const applicationController = new ApplicationController();

// All candidate routes require authentication
router.use(requireAuth);

router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidateById);
router.get('/:id/recommended-jobs', applicationController.getRecommendedJobs);

export const candidateRoutes = router;
