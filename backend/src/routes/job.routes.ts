import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { RankingController } from '../controllers/ranking.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const jobController = new JobController();
const rankingController = new RankingController();

// All job routes require authentication
router.use(requireAuth);

router.post('/', jobController.createJob);
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.patch('/:id/close', jobController.closeJob);

// Rank candidates for a job
router.get('/:id/rank', rankingController.rankCandidates);

export const jobRoutes = router;
