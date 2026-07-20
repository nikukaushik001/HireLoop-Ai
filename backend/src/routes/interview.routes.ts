import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const applicationController = new ApplicationController();

// --- PUBLIC MAGIC LINK ROUTES ---
// These routes DO NOT require HR authentication so external interviewers can submit feedback
router.get('/magic/:id', applicationController.getMagicInterviewDetails);
router.post('/magic/:id/feedback', applicationController.submitMagicInterviewFeedback);

// --- PROTECTED ROUTES ---
router.use(requireAuth);

// Get ALL interviews (for the Interviews dashboard page)
router.get('/', applicationController.getAllInterviews);

// Submit feedback for a specific interview (Internal HR)
router.patch('/:id/feedback', applicationController.submitInterviewFeedback);

export const interviewRoutes = router;
