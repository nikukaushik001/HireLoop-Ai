import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const applicationController = new ApplicationController();

router.use(requireAuth);

// Get ALL interviews (for the Interviews dashboard page)
router.get('/', applicationController.getAllInterviews);

// Submit feedback for a specific interview
router.patch('/:id/feedback', applicationController.submitInterviewFeedback);

export const interviewRoutes = router;
