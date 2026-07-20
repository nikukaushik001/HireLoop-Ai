import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const applicationController = new ApplicationController();

router.use(requireAuth);

router.get('/stats', applicationController.getDashboardStats);
router.get('/recent-applications', applicationController.getRecentApplications);

export const dashboardRoutes = router;
