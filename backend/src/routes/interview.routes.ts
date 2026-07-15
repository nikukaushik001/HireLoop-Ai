import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const applicationController = new ApplicationController();

router.use(requireAuth);

router.patch('/:id/feedback', applicationController.submitInterviewFeedback);

export const interviewRoutes = router;
