import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true }); // Important: mergeParams to access jobId from parent route
const applicationController = new ApplicationController();

router.use(requireAuth);

router.patch('/:appId/status', applicationController.updateApplicationStatus);
router.post('/:appId/interviews', applicationController.scheduleInterview);

export const applicationRoutes = router;
