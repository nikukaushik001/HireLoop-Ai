import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const candidateController = new CandidateController();

// All candidate routes require authentication
router.use(requireAuth);

router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidateById);

export const candidateRoutes = router;
